import { App, Stack } from '@aws-cdk/core';
import { SpotInstance } from '../src';
import '@aws-cdk/assert/jest';

describe('SpotInstance', () => {
  let mockApp: App;
  let stack: Stack;

  beforeEach(() => {
    mockApp = new App();
    stack = new Stack(mockApp, 'testing-stack');
  });

  test('create single spot instance', () => {
    new SpotInstance(stack, 'SpotInstance');
    expect(stack).toHaveResourceLike('AWS::EC2::LaunchTemplate', {
      LaunchTemplateData: {
        ImageId: {
          Ref: 'SsmParameterValueawsserviceamiamazonlinuxlatestamzn2amihvmx8664gp2C96584B6F00A464EAD1953AFF4B05118Parameter',
        },
        InstanceMarketOptions: {
          MarketType: 'spot',
          SpotOptions: {
            InstanceInterruptionBehavior: 'terminate',
            SpotInstanceType: 'one-time',
          },
        },
        InstanceType: 't3.large',
        TagSpecifications: [
          {
            ResourceType: 'instance',
            Tags: [
              {
                Key: 'Name',
                Value: 'testing-stack/launchTemplateForInstance',
              },
            ],
          },
        ],
        UserData: {
          'Fn::Base64': '#!/bin/bash',
        },
      },
    });
    expect(stack).toHaveResourceLike('AWS::EC2::Instance', {
      AvailabilityZone: {
        'Fn::Select': [
          0,
          {
            'Fn::GetAZs': '',
          },
        ],
      },
      BlockDeviceMappings: [
        {
          DeviceName: '/dev/xvda',
          Ebs: {
            VolumeSize: 60,
          },
        },
      ],
      ImageId: {
        Ref: 'SsmParameterValueawsserviceamiamazonlinuxlatestamzn2amihvmx8664gp2C96584B6F00A464EAD1953AFF4B05118Parameter',
      },
      InstanceType: 't3.large',
      LaunchTemplate: {
        LaunchTemplateId: {
          Ref: 'SpotInstancelaunchTemplateForInstanceLaunchTemplate72A37BAE',
        },
        Version: {
          'Fn::GetAtt': [
            'SpotInstancelaunchTemplateForInstanceLaunchTemplate72A37BAE',
            'LatestVersionNumber',
          ],
        },
      },
      SecurityGroupIds: [
        {
          'Fn::GetAtt': [
            'SpotInstanceSpotFleetSg64BACBCF',
            'GroupId',
          ],
        },
      ],
      SubnetId: {
        Ref: 'VpcPublicSubnet1Subnet5C2D37C4',
      },
      Tags: [
        {
          Key: 'Name',
          Value: 'testing-stack/SpotInstance/SpotInstance',
        },
      ],
      UserData: {
        'Fn::Base64': '#!/bin/bash\nyum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm\nyum install -y docker\nusermod -aG docker ec2-user\nusermod -aG docker ssm-user\nservice docker start',
      },
    });
  });
});
