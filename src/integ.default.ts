import { InstanceType } from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import { VpcProvider, SpotInstance } from './spot';

export class IntegTesting {
  readonly stack: cdk.Stack[];

  constructor() {

    const app = new cdk.App();

    const env = {
      region: process.env.CDK_DEFAULT_REGION,
      account: process.env.CDK_DEFAULT_ACCOUNT,
    };

    const stackName = app.node.tryGetContext('stackName') || 'SpotOneStack';
    const stack = new cdk.Stack(app, stackName, { env });

    const instanceType = stack.node.tryGetContext('instance_type') || 't3.large';
    const eipAllocationId = stack.node.tryGetContext('eip_allocation_id');
    const volumeSize = stack.node.tryGetContext('volume_size') || 60;
    const keyName = stack.node.tryGetContext('ssh_key_name');
    const vpc = VpcProvider.getOrCreate(stack);

    new SpotInstance(stack, 'SpotInstance', {
      vpc,
      // instanceInterruptionBehavior: InstanceInterruptionBehavior.STOP,
      eipAllocationId: eipAllocationId,
      assignEip: false,
      defaultInstanceType: new InstanceType(instanceType),
      keyName,
      ebsVolumeSize: volumeSize,
    });

    new SpotInstance(stack, 'SpotInstanceUbuntu', {
      vpc,
      customAmiId: 'ami-076d8ebdd0e1ec091', //ubuntu ami id.
      defaultInstanceType: new InstanceType('t4g.medium'),
      keyName,
      blockDeviceMappings: [{ deviceName: '/dev/sda1', ebs: { volumeSize: 20 } }],
      additionalUserData: ['curl -fsSL https://get.docker.com -o get-docker.sh', 'sudo sh get-docker.sh'],
    });
    this.stack = [stack];
  }
}

// run the integ testing
new IntegTesting();


