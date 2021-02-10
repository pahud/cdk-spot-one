import { InstanceType } from '@aws-cdk/aws-ec2';
import * as cdk from '@aws-cdk/core';
import { InstanceInterruptionBehavior } from './index';
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
      instanceInterruptionBehavior: InstanceInterruptionBehavior.STOP,
      eipAllocationId: eipAllocationId,
      assignEip: false,
      defaultInstanceType: new InstanceType(instanceType),
      keyName,
      ebsVolumeSize: volumeSize,
    });

    // const fleet = new SpotFleet(stack, 'SpotFleet', {
    //   vpc,
    //   instanceOnly: true,
    //   instanceInterruptionBehavior: InstanceInterruptionBehavior.STOP,
    //   blockDuration: BlockDuration.SIX_HOURS,
    //   eipAllocationId: eipAllocationId,
    //   assignEip: false,
    //   defaultInstanceType: new InstanceType(instanceType),
    //   keyName,
    //   blockDeviceMappings: [
    //     {
    //       deviceName: '/dev/xvda',
    //       ebs: {
    //         volumeSize,
    //       },
    //     },
    //   ],
    // });

    // const expireAfter = stack.node.tryGetContext('expire_after');
    // if (expireAfter) {
    //   fleet.expireAfter(cdk.Duration.hours(expireAfter));
    // }

    this.stack = [stack];
  }
}

// run the integ testing
new IntegTesting();


