import { SpotFleet, InstanceInterruptionBehavior } from '../index';
import { App, Stack, Duration } from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import '@aws-cdk/assert/jest';
import { BlockDuration } from '../spot';

describe('Spot Fleet tests', () => {

  test('create the HTTP API', () => {
    const mockApp = new App();
    const stack = new Stack(mockApp, 'testing-stack');

    const fleet = new SpotFleet(stack, 'SpotFleet', {
      targetCapacity: 1,
      blockDuration: BlockDuration.SIX_HOURS,
      instanceInterruptionBehavior: InstanceInterruptionBehavior.HIBERNATE,
      defaultInstanceType: new ec2.InstanceType('t3.large'),
      eipAllocationId: 'eipalloc-0d1bc6d85895a5410',
      vpcSubnet: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      terminateInstancesWithExpiration: true,
    });
    // fleet to expire after 6 hours
    fleet.expireAfter(Duration.hours(6));
    fleet.defaultSecurityGroup.connections.allowFromAnyIpv4(ec2.Port.tcp(80));
    expect(stack).toHaveResource('AWS::EC2::SpotFleet');
    expect(stack).toHaveResourceLike('AWS::EC2::LaunchTemplate', {
      LaunchTemplateData: {
        InstanceMarketOptions: {
          MarketType: 'spot',
          SpotOptions: {
            BlockDurationMinutes: 360,
            InstanceInterruptionBehavior: 'hibernate',
          },
        },
      },
    });
    expect(stack).toHaveResource('AWS::EC2::SecurityGroup', {
      SecurityGroupIngress: [
        {
          CidrIp: '0.0.0.0/0',
          Description: 'from 0.0.0.0/0:22',
          FromPort: 22,
          IpProtocol: 'tcp',
          ToPort: 22,
        },
        {
          CidrIp: '0.0.0.0/0',
          Description: 'from 0.0.0.0/0:80',
          FromPort: 80,
          IpProtocol: 'tcp',
          ToPort: 80,
        },
      ],
    });
  });
  
  test('support additional user data', () => {
    const mockApp = new App();
    const stack = new Stack(mockApp, 'testing-stack');

    new SpotFleet(stack, 'SpotFleet', {
      targetCapacity: 1,
      blockDuration: BlockDuration.SIX_HOURS,
      instanceInterruptionBehavior: InstanceInterruptionBehavior.HIBERNATE,
      defaultInstanceType: new ec2.InstanceType('t3.large'),
      vpcSubnet: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      terminateInstancesWithExpiration: true,
      additionalUserData: [ 
        'mycommand1',
        'mycommand2 arg1',
      ],
    });
  
    expect(stack).toHaveResourceLike('AWS::EC2::LaunchTemplate', {
      LaunchTemplateData: {
        UserData: {
          'Fn::Base64': '#!/bin/bash\nyum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm\nyum install -y docker\nusermod -aG docker ec2-user\nusermod -aG docker ssm-user\nservice docker start\nmycommand1\nmycommand2 arg1',
        },
      },
    });
  });

  test('long time spot fleet', () => {
    const mockApp = new App();
    const stack = new Stack(mockApp, 'testing-stack');

    new SpotFleet(stack, 'SpotFleet', {
      targetCapacity: 1,
      blockDuration: BlockDuration.NONE,
      defaultInstanceType: new ec2.InstanceType('t3.large'),
      vpcSubnet: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      terminateInstancesWithExpiration: true,
    });
  
    expect(stack).toHaveResourceLike('AWS::EC2::LaunchTemplate', {
      LaunchTemplateData: {
        InstanceMarketOptions: {
          MarketType: 'spot',
          SpotOptions: {
            InstanceInterruptionBehavior: 'terminate',
          },
        },
      },
    });
  });
});
