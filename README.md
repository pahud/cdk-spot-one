[![awscdk-jsii-template](https://img.shields.io/badge/built%20with-awscdk--jsii--template-blue)](https://github.com/pahud/awscdk-jsii-template)
[![NPM version](https://badge.fury.io/js/cdk-spot-one.svg)](https://badge.fury.io/js/cdk-spot-one)
[![PyPI version](https://badge.fury.io/py/cdk-spot-one.svg)](https://badge.fury.io/py/cdk-spot-one)
![Release](https://github.com/pahud/cdk-spot-one/workflows/Release/badge.svg)

# cdk-spot-one

One spot instance with EIP and defined duration. No interruption.

# Why

Sometimes we need an Amazon EC2 instance with static fixed IP for testing or development purpose for a duration of
time(probably hours). We need to make sure during this time, no interruption will occur and we don't want to pay
for on-demand rate. `cdk-spot-one` helps you reserve one single spot instance with pre-allocated or new
Elastic IP addresses(EIP) with defined `blockDuration`, during which time the spot instance will be secured with no spot interruption.

Behind the scene, `cdk-spot-one` provisions a spot fleet with capacity of single instance for you and it associates the EIP with this instance. The spot fleet is reserved as spot block with `blockDuration` from one hour up to six hours to ensure the high availability for your spot instance.

Multiple spot instances are possible by simply specifying the `targetCapacity` construct property, but we only associate the EIP with the first spot instance at this moment.

Enjoy your highly durable one spot instance with AWS CDK!

# Constructs

This library provides two major constructs:

## SpotInstance

- Create a spot instance **without** any fleet
- Does **NOT** support [Spot Block](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-requests.html#fixed-duration-spot-instances)
- Support `stop` or `hibernate` instance

Scenario: To leverage the `stop` or `hibernate` capabilities of the spot instance to persist the data in the ebs volume.


## SpotFleet

- Create a spot instance with a [Spot Fleet](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-fleet.html)
- Support [Spot Block](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-requests.html#fixed-duration-spot-instances)
- Does **NOT** support `stop` or `hibernate` instance

Scenario: To ensure the availability with no disruption with defined period up to 6 hours.

# Sample

## SpotInstance

```ts
import { SpotInstance } from 'cdk-spot-one';

new SpotInstance(stack, 'SpotInstance');
```

## SpotFleet

```ts
import { SpotFleet } from 'cdk-spot-one';

// create the first fleet for one hour and associate with our existing EIP
const fleet = new SpotFleet(stack, 'SpotFleet')

// configure the expiration after 1 hour
fleet.expireAfter(Duration.hours(1))


// create the 2nd fleet with single Gravition 2 instance for 6 hours and associate with new EIP
const fleet2 = new SpotFleet(stack, 'SpotFleet2', {
  blockDuration: BlockDuration.SIX_HOURS,
  eipAllocationId: 'eipalloc-0d1bc6d85895a5410',
  defaultInstanceType: new InstanceType('c6g.large'),
  vpc: fleet.vpc,
})
// configure the expiration after 6 hours
fleet2.expireAfter(Duration.hours(6))

// print the instanceId from each spot fleet
new CfnOutput(stack, 'SpotFleetInstanceId', { value: fleet.instanceId })
new CfnOutput(stack, 'SpotFleet2InstanceId', { value: fleet2.instanceId })

```

# Create spot instances without duration block

```ts
const fleet = new SpotFleet(stack, 'SpotFleet', {
  blockDuration: BlockDuration.NONE,
})
```

NOTE: This kind of spot instance will be interrupted by AWS. However the fleet is using type [maintain](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-fleet.html#spot-fleet-allocation-strategy), the fleet can be refulfilled.

# ARM64 and Graviton 2 support

`cdk-spot-one` selects the latest Amazon Linux 2 AMI for your `ARM64` instances. Simply select the instance types with the `defaultInstanceType` property and the `SpotFleet` will auto configure correct AMI for the instance.


```ts
defaultInstanceType: new InstanceType('c6g.large')
```

# SSH connect

By default the `cdk-spot-one` does not bind any SSH public key for you on the instance. You are encouraged to use `ec2-instance-connect` to send your public key from local followed by one-time SSH connect.

For example:

```sh
pubkey="$HOME/.ssh/aws_2020_id_rsa.pub"
echo "sending public key to ${instanceId}"
aws ec2-instance-connect send-ssh-public-key --instance-id ${instanceId} --instance-os-user ec2-user \
--ssh-public-key file://${pubkey} --availability-zone ${az} 
```
## npx ec2-connect INSTANCE_ID

To connect to the instance, run `npx ec2-connect` as below:

```sh
$ npx ec2-connect i-01f827ab9de7b93a9
```

or 

```sh
$ npx ec2-connect i-01f827ab9de7b93a9 ~/.ssh/other_public_key_path
```
If you are using different SSH public key(default is ~/.ssh/id_rsa.pub)
