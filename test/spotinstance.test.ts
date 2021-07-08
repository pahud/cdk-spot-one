import * as ec2 from '@aws-cdk/aws-ec2';
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
    new SpotInstance(stack, 'SpotInstance', { ebsVolumeSize: 60 });
    expect(stack).toHaveResourceLike('AWS::EC2::LaunchTemplate', {
      LaunchTemplateData: {
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
        InstanceMarketOptions: {
          MarketType: 'spot',
          SpotOptions: {
            SpotInstanceType: 'persistent',
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
          'Fn::Base64': '#!/bin/bash\nyum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm\nyum install -y docker\nusermod -aG docker ec2-user\nusermod -aG docker ssm-user\nservice docker start',
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
    });
  });
});


describe('SpotInstance Custom AMI ID', () => {
  let mockApp: App;
  let stack: Stack;

  beforeEach(() => {
    mockApp = new App();
    stack = new Stack(mockApp, 'testing-stack');
  });

  test('create single spot instance Custom AMI ID', () => {
    new SpotInstance(stack, 'SpotInstance', {
      customAmiId: 'ami-076d8ebdd0e1ec091', //ubuntu ami id.
      defaultInstanceType: new ec2.InstanceType('t4g.medium'),
      blockDeviceMappings: [{ deviceName: '/dev/sda1', ebs: { volumeSize: 10 } }],
      additionalUserData: ['curl -fsSL https://get.docker.com -o get-docker.sh', 'sudo sh get-docker.sh'],
    });
    expect(stack).toHaveResourceLike('AWS::EC2::LaunchTemplate', {
      LaunchTemplateData: {
        BlockDeviceMappings: [
          {
            DeviceName: '/dev/sda1',
            Ebs: {
              VolumeSize: 10,
            },
          },
        ],
        IamInstanceProfile: {
          Arn: {
            'Fn::GetAtt': [
              'SpotInstanceInstanceProfile5F126FC8',
              'Arn',
            ],
          },
        },
        ImageId: 'ami-076d8ebdd0e1ec091',
        InstanceMarketOptions: {
          MarketType: 'spot',
          SpotOptions: {
            SpotInstanceType: 'persistent',
          },
        },
        InstanceType: 't4g.medium',
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
          'Fn::Base64': '#!/bin/bash\ncurl -fsSL https://get.docker.com -o get-docker.sh\nsudo sh get-docker.sh',
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
    });
  });
});
