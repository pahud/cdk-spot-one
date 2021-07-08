# API Reference

**Classes**

Name|Description
----|-----------
[LaunchTemplate](#cdk-spot-one-launchtemplate)|*No description*
[LaunchTemplateResource](#cdk-spot-one-launchtemplateresource)|*No description*
[SpotFleet](#cdk-spot-one-spotfleet)|*No description*
[SpotInstance](#cdk-spot-one-spotinstance)|*No description*
[SpotOne](#cdk-spot-one-spotone)|*No description*
[VpcProvider](#cdk-spot-one-vpcprovider)|*No description*


**Structs**

Name|Description
----|-----------
[BaseSpotFleetProps](#cdk-spot-one-basespotfleetprops)|*No description*
[LaunchTemplateProps](#cdk-spot-one-launchtemplateprops)|*No description*
[SpotFleetLaunchTemplateConfig](#cdk-spot-one-spotfleetlaunchtemplateconfig)|*No description*
[SpotFleetProps](#cdk-spot-one-spotfleetprops)|*No description*
[SpotInstanceProps](#cdk-spot-one-spotinstanceprops)|*No description*
[SpotOneProps](#cdk-spot-one-spotoneprops)|*No description*


**Interfaces**

Name|Description
----|-----------
[ILaunchtemplate](#cdk-spot-one-ilaunchtemplate)|*No description*


**Enums**

Name|Description
----|-----------
[BlockDuration](#cdk-spot-one-blockduration)|*No description*
[InstanceInterruptionBehavior](#cdk-spot-one-instanceinterruptionbehavior)|*No description*
[NodeType](#cdk-spot-one-nodetype)|Whether the worker nodes should support GPU or just standard instances.



## class LaunchTemplate  <a id="cdk-spot-one-launchtemplate"></a>



__Implements__: [ILaunchtemplate](#cdk-spot-one-ilaunchtemplate)

### Initializer




```ts
new LaunchTemplate()
```



### Methods


#### bind(spotfleet) <a id="cdk-spot-one-launchtemplate-bind"></a>



```ts
bind(spotfleet: SpotFleet): SpotFleetLaunchTemplateConfig
```

* **spotfleet** (<code>[SpotFleet](#cdk-spot-one-spotfleet)</code>)  *No description*

__Returns__:
* <code>[SpotFleetLaunchTemplateConfig](#cdk-spot-one-spotfleetlaunchtemplateconfig)</code>



## class LaunchTemplateResource  <a id="cdk-spot-one-launchtemplateresource"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new LaunchTemplateResource(scope: Construct, id: string, props?: LaunchTemplateProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[LaunchTemplateProps](#cdk-spot-one-launchtemplateprops)</code>)  *No description*
  * **blockDeviceMappings** (<code>Array<[CfnLaunchTemplate.BlockDeviceMappingProperty](#aws-cdk-aws-ec2-cfnlaunchtemplate-blockdevicemappingproperty)></code>)  blockDeviceMappings for config instance. __*Default*__: from ami config.
  * **defaultInstanceType** (<code>[InstanceType](#aws-cdk-aws-ec2-instancetype)</code>)  *No description* __*Optional*__
  * **iamInstanceProfile** (<code>[CfnInstanceProfile](#aws-cdk-aws-iam-cfninstanceprofile)</code>)  *No description* __*Optional*__
  * **imageId** (<code>string</code>)  *No description* __*Optional*__
  * **instanceMarketOptions** (<code>[CfnLaunchTemplate.InstanceMarketOptionsProperty](#aws-cdk-aws-ec2-cfnlaunchtemplate-instancemarketoptionsproperty)</code>)  *No description* __*Optional*__
  * **keyName** (<code>string</code>)  *No description* __*Optional*__
  * **securityGroup** (<code>Array<[ISecurityGroup](#aws-cdk-aws-ec2-isecuritygroup)></code>)  *No description* __*Optional*__
  * **userData** (<code>[UserData](#aws-cdk-aws-ec2-userdata)</code>)  *No description* __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**defaultInstanceType** | <code>[InstanceType](#aws-cdk-aws-ec2-instancetype)</code> | <span></span>
**resource** | <code>[CfnLaunchTemplate](#aws-cdk-aws-ec2-cfnlaunchtemplate)</code> | <span></span>



## class SpotFleet  <a id="cdk-spot-one-spotfleet"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [SpotOne](#cdk-spot-one-spotone)

### Initializer




```ts
new SpotFleet(scope: Construct, id: string, props?: SpotFleetProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[SpotFleetProps](#cdk-spot-one-spotfleetprops)</code>)  *No description*
  * **additionalUserData** (<code>Array<string></code>)  Additional commands for user data. __*Default*__: no additional user data
  * **assignEip** (<code>boolean</code>)  Auto assign a new EIP on this instance if `eipAllocationId` is not defined. __*Default*__: true
  * **customAmiId** (<code>string</code>)  custom AMI ID. __*Default*__: The latest Amaozn Linux 2 AMI ID
  * **defaultInstanceType** (<code>[InstanceType](#aws-cdk-aws-ec2-instancetype)</code>)  default EC2 instance type. __*Default*__: t3.large
  * **ebsVolumeSize** (<code>number</code>)  default EBS volume size for the spot instance. __*Default*__: 60;
  * **eipAllocationId** (<code>string</code>)  Allocation ID for your existing Elastic IP Address. __*Optional*__
  * **instanceInterruptionBehavior** (<code>[InstanceInterruptionBehavior](#cdk-spot-one-instanceinterruptionbehavior)</code>)  The behavior when a Spot Instance is interrupted. __*Default*__: InstanceInterruptionBehavior.TERMINATE
  * **instanceProfile** (<code>[CfnInstanceProfile](#aws-cdk-aws-iam-cfninstanceprofile)</code>)  instance profile for the resource. __*Default*__: create a new one
  * **instanceRole** (<code>[IRole](#aws-cdk-aws-iam-irole)</code>)  IAM role for the spot instance. __*Optional*__
  * **keyName** (<code>string</code>)  SSH key name. __*Default*__: no ssh key will be assigned
  * **securityGroup** (<code>[SecurityGroup](#aws-cdk-aws-ec2-securitygroup)</code>)  Security group for the spot fleet. __*Default*__: allows TCP 22 SSH ingress rule
  * **targetCapacity** (<code>number</code>)  number of the target capacity. __*Default*__: 1
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  VPC for the spot fleet. __*Default*__: new VPC will be created
  * **vpcSubnet** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  VPC subnet for the spot fleet. __*Default*__: public subnet
  * **blockDeviceMappings** (<code>Array<[CfnLaunchTemplate.BlockDeviceMappingProperty](#aws-cdk-aws-ec2-cfnlaunchtemplate-blockdevicemappingproperty)></code>)  blockDeviceMappings for config instance. __*Default*__: from ami config.
  * **blockDuration** (<code>[BlockDuration](#cdk-spot-one-blockduration)</code>)  reservce the spot instance as spot block with defined duration. __*Default*__: BlockDuration.ONE_HOUR
  * **terminateInstancesWithExpiration** (<code>boolean</code>)  terminate the instance when the allocation is expired. __*Default*__: true
  * **validFrom** (<code>string</code>)  the time when the spot fleet allocation starts. __*Default*__: no expiration
  * **validUntil** (<code>string</code>)  the time when the spot fleet allocation expires. __*Default*__: no expiration
  * **instanceOnly** (<code>boolean</code>)  Whether to create spot instance only instead of a fleet. __*Default*__: false;
  * **launchTemplate** (<code>[ILaunchtemplate](#cdk-spot-one-ilaunchtemplate)</code>)  Launch template for the spot fleet. __*Optional*__



### Properties


Name | Type | Description 
-----|------|-------------
**launchTemplate** | <code>[ILaunchtemplate](#cdk-spot-one-ilaunchtemplate)</code> | <span></span>
**spotFleetId** | <code>string</code> | <span></span>
**instanceId**? | <code>string</code> | the first instance id in this fleet.<br/>__*Optional*__
**instanceInterruptionBehavior**? | <code>[InstanceInterruptionBehavior](#cdk-spot-one-instanceinterruptionbehavior)</code> | The behavior when a Spot Instance is interrupted.<br/>__*Default*__: terminate
**instanceType**? | <code>string</code> | instance type of the first instance in this fleet.<br/>__*Optional*__
**spotFleetRequestId**? | <code>string</code> | SpotFleetRequestId for this spot fleet.<br/>__*Optional*__
**targetCapacity**? | <code>number</code> | __*Optional*__

### Methods


#### expireAfter(duration) <a id="cdk-spot-one-spotfleet-expireafter"></a>



```ts
expireAfter(duration: Duration): void
```

* **duration** (<code>[Duration](#aws-cdk-core-duration)</code>)  *No description*






## class SpotInstance  <a id="cdk-spot-one-spotinstance"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [SpotOne](#cdk-spot-one-spotone)

### Initializer




```ts
new SpotInstance(scope: Construct, id: string, props?: SpotInstanceProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[SpotInstanceProps](#cdk-spot-one-spotinstanceprops)</code>)  *No description*
  * **additionalUserData** (<code>Array<string></code>)  Additional commands for user data. __*Default*__: no additional user data
  * **assignEip** (<code>boolean</code>)  Auto assign a new EIP on this instance if `eipAllocationId` is not defined. __*Default*__: true
  * **customAmiId** (<code>string</code>)  custom AMI ID. __*Default*__: The latest Amaozn Linux 2 AMI ID
  * **defaultInstanceType** (<code>[InstanceType](#aws-cdk-aws-ec2-instancetype)</code>)  default EC2 instance type. __*Default*__: t3.large
  * **ebsVolumeSize** (<code>number</code>)  default EBS volume size for the spot instance. __*Default*__: 60;
  * **eipAllocationId** (<code>string</code>)  Allocation ID for your existing Elastic IP Address. __*Optional*__
  * **instanceInterruptionBehavior** (<code>[InstanceInterruptionBehavior](#cdk-spot-one-instanceinterruptionbehavior)</code>)  The behavior when a Spot Instance is interrupted. __*Default*__: InstanceInterruptionBehavior.TERMINATE
  * **instanceProfile** (<code>[CfnInstanceProfile](#aws-cdk-aws-iam-cfninstanceprofile)</code>)  instance profile for the resource. __*Default*__: create a new one
  * **instanceRole** (<code>[IRole](#aws-cdk-aws-iam-irole)</code>)  IAM role for the spot instance. __*Optional*__
  * **keyName** (<code>string</code>)  SSH key name. __*Default*__: no ssh key will be assigned
  * **securityGroup** (<code>[SecurityGroup](#aws-cdk-aws-ec2-securitygroup)</code>)  Security group for the spot fleet. __*Default*__: allows TCP 22 SSH ingress rule
  * **targetCapacity** (<code>number</code>)  number of the target capacity. __*Default*__: 1
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  VPC for the spot fleet. __*Default*__: new VPC will be created
  * **vpcSubnet** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  VPC subnet for the spot fleet. __*Default*__: public subnet
  * **blockDeviceMappings** (<code>Array<[CfnLaunchTemplate.BlockDeviceMappingProperty](#aws-cdk-aws-ec2-cfnlaunchtemplate-blockdevicemappingproperty)></code>)  blockDeviceMappings for config instance. __*Default*__: from ami config.



### Properties


Name | Type | Description 
-----|------|-------------
**instanceId**? | <code>string</code> | __*Optional*__
**instanceType**? | <code>string</code> | __*Optional*__



## class SpotOne  <a id="cdk-spot-one-spotone"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)
__Implemented by__: [SpotFleet](#cdk-spot-one-spotfleet), [SpotInstance](#cdk-spot-one-spotinstance)

### Initializer




```ts
new SpotOne(scope: Construct, id: string, props: SpotOneProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[SpotOneProps](#cdk-spot-one-spotoneprops)</code>)  *No description*
  * **additionalUserData** (<code>Array<string></code>)  Additional commands for user data. __*Default*__: no additional user data
  * **assignEip** (<code>boolean</code>)  Auto assign a new EIP on this instance if `eipAllocationId` is not defined. __*Default*__: true
  * **customAmiId** (<code>string</code>)  custom AMI ID. __*Default*__: The latest Amaozn Linux 2 AMI ID
  * **defaultInstanceType** (<code>[InstanceType](#aws-cdk-aws-ec2-instancetype)</code>)  default EC2 instance type. __*Default*__: t3.large
  * **ebsVolumeSize** (<code>number</code>)  default EBS volume size for the spot instance. __*Default*__: 60;
  * **eipAllocationId** (<code>string</code>)  Allocation ID for your existing Elastic IP Address. __*Optional*__
  * **instanceInterruptionBehavior** (<code>[InstanceInterruptionBehavior](#cdk-spot-one-instanceinterruptionbehavior)</code>)  The behavior when a Spot Instance is interrupted. __*Default*__: InstanceInterruptionBehavior.TERMINATE
  * **instanceProfile** (<code>[CfnInstanceProfile](#aws-cdk-aws-iam-cfninstanceprofile)</code>)  instance profile for the resource. __*Default*__: create a new one
  * **instanceRole** (<code>[IRole](#aws-cdk-aws-iam-irole)</code>)  IAM role for the spot instance. __*Optional*__
  * **keyName** (<code>string</code>)  SSH key name. __*Default*__: no ssh key will be assigned
  * **securityGroup** (<code>[SecurityGroup](#aws-cdk-aws-ec2-securitygroup)</code>)  Security group for the spot fleet. __*Default*__: allows TCP 22 SSH ingress rule
  * **targetCapacity** (<code>number</code>)  number of the target capacity. __*Default*__: 1
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  VPC for the spot fleet. __*Default*__: new VPC will be created
  * **vpcSubnet** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  VPC subnet for the spot fleet. __*Default*__: public subnet



### Properties


Name | Type | Description 
-----|------|-------------
**defaultInstanceType** | <code>[InstanceType](#aws-cdk-aws-ec2-instancetype)</code> | <span></span>
**defaultSecurityGroup** | <code>[ISecurityGroup](#aws-cdk-aws-ec2-isecuritygroup)</code> | The default security group of the instance, which only allows TCP 22 SSH ingress rule.
**imageId** | <code>string</code> | <span></span>
**userData** | <code>[UserData](#aws-cdk-aws-ec2-userdata)</code> | <span></span>
**vpc** | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | <span></span>
**instanceId**? | <code>string</code> | __*Optional*__
**instanceProfile**? | <code>[CfnInstanceProfile](#aws-cdk-aws-iam-cfninstanceprofile)</code> | __*Optional*__
**instanceRole**? | <code>[IRole](#aws-cdk-aws-iam-irole)</code> | __*Optional*__
**instanceType**? | <code>string</code> | __*Optional*__

### Methods


#### protected associateEip(props) <a id="cdk-spot-one-spotone-associateeip"></a>



```ts
protected associateEip(props: SpotOneProps): void
```

* **props** (<code>[SpotOneProps](#cdk-spot-one-spotoneprops)</code>)  *No description*
  * **additionalUserData** (<code>Array<string></code>)  Additional commands for user data. __*Default*__: no additional user data
  * **assignEip** (<code>boolean</code>)  Auto assign a new EIP on this instance if `eipAllocationId` is not defined. __*Default*__: true
  * **customAmiId** (<code>string</code>)  custom AMI ID. __*Default*__: The latest Amaozn Linux 2 AMI ID
  * **defaultInstanceType** (<code>[InstanceType](#aws-cdk-aws-ec2-instancetype)</code>)  default EC2 instance type. __*Default*__: t3.large
  * **ebsVolumeSize** (<code>number</code>)  default EBS volume size for the spot instance. __*Default*__: 60;
  * **eipAllocationId** (<code>string</code>)  Allocation ID for your existing Elastic IP Address. __*Optional*__
  * **instanceInterruptionBehavior** (<code>[InstanceInterruptionBehavior](#cdk-spot-one-instanceinterruptionbehavior)</code>)  The behavior when a Spot Instance is interrupted. __*Default*__: InstanceInterruptionBehavior.TERMINATE
  * **instanceProfile** (<code>[CfnInstanceProfile](#aws-cdk-aws-iam-cfninstanceprofile)</code>)  instance profile for the resource. __*Default*__: create a new one
  * **instanceRole** (<code>[IRole](#aws-cdk-aws-iam-irole)</code>)  IAM role for the spot instance. __*Optional*__
  * **keyName** (<code>string</code>)  SSH key name. __*Default*__: no ssh key will be assigned
  * **securityGroup** (<code>[SecurityGroup](#aws-cdk-aws-ec2-securitygroup)</code>)  Security group for the spot fleet. __*Default*__: allows TCP 22 SSH ingress rule
  * **targetCapacity** (<code>number</code>)  number of the target capacity. __*Default*__: 1
  * **vpc** (<code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>)  VPC for the spot fleet. __*Default*__: new VPC will be created
  * **vpcSubnet** (<code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code>)  VPC subnet for the spot fleet. __*Default*__: public subnet




#### protected createInstanceProfile(role) <a id="cdk-spot-one-spotone-createinstanceprofile"></a>



```ts
protected createInstanceProfile(role: IRole): CfnInstanceProfile
```

* **role** (<code>[IRole](#aws-cdk-aws-iam-irole)</code>)  *No description*

__Returns__:
* <code>[CfnInstanceProfile](#aws-cdk-aws-iam-cfninstanceprofile)</code>

#### protected createInstanceRole() <a id="cdk-spot-one-spotone-createinstancerole"></a>



```ts
protected createInstanceRole(): IRole
```


__Returns__:
* <code>[IRole](#aws-cdk-aws-iam-irole)</code>

#### protected createSecurityGroup() <a id="cdk-spot-one-spotone-createsecuritygroup"></a>



```ts
protected createSecurityGroup(): SecurityGroup
```


__Returns__:
* <code>[SecurityGroup](#aws-cdk-aws-ec2-securitygroup)</code>



## class VpcProvider  <a id="cdk-spot-one-vpcprovider"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable), [ITaggable](#aws-cdk-core-itaggable)
__Extends__: [Stack](#aws-cdk-core-stack)

### Initializer


Creates a new stack.

```ts
new VpcProvider(scope?: Construct, id?: string, props?: StackProps)
```

* **scope** (<code>[Construct](#constructs-construct)</code>)  Parent of this stack, usually an `App` or a `Stage`, but could be any construct.
* **id** (<code>string</code>)  The construct ID of this stack.
* **props** (<code>[StackProps](#aws-cdk-core-stackprops)</code>)  Stack properties.
  * **analyticsReporting** (<code>boolean</code>)  Include runtime versioning information in this Stack. __*Default*__: `analyticsReporting` setting of containing `App`, or value of 'aws:cdk:version-reporting' context key
  * **description** (<code>string</code>)  A description of the stack. __*Default*__: No description.
  * **env** (<code>[Environment](#aws-cdk-core-environment)</code>)  The AWS environment (account/region) where this stack will be deployed. __*Default*__: The environment of the containing `Stage` if available, otherwise create the stack will be environment-agnostic.
  * **stackName** (<code>string</code>)  Name to deploy the stack with. __*Default*__: Derived from construct path.
  * **synthesizer** (<code>[IStackSynthesizer](#aws-cdk-core-istacksynthesizer)</code>)  Synthesis method to use while deploying this stack. __*Default*__: `DefaultStackSynthesizer` if the `@aws-cdk/core:newStyleStackSynthesis` feature flag is set, `LegacyStackSynthesizer` otherwise.
  * **tags** (<code>Map<string, string></code>)  Stack tags that will be applied to all the taggable resources and the stack itself. __*Default*__: {}
  * **terminationProtection** (<code>boolean</code>)  Whether to enable termination protection for this stack. __*Default*__: false


### Methods


#### *static* getOrCreate(scope) <a id="cdk-spot-one-vpcprovider-getorcreate"></a>



```ts
static getOrCreate(scope: Construct): IVpc
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*

__Returns__:
* <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code>



## struct BaseSpotFleetProps  <a id="cdk-spot-one-basespotfleetprops"></a>






Name | Type | Description 
-----|------|-------------
**additionalUserData**? | <code>Array<string></code> | Additional commands for user data.<br/>__*Default*__: no additional user data
**assignEip**? | <code>boolean</code> | Auto assign a new EIP on this instance if `eipAllocationId` is not defined.<br/>__*Default*__: true
**blockDeviceMappings**? | <code>Array<[CfnLaunchTemplate.BlockDeviceMappingProperty](#aws-cdk-aws-ec2-cfnlaunchtemplate-blockdevicemappingproperty)></code> | blockDeviceMappings for config instance.<br/>__*Default*__: from ami config.
**blockDuration**? | <code>[BlockDuration](#cdk-spot-one-blockduration)</code> | reservce the spot instance as spot block with defined duration.<br/>__*Default*__: BlockDuration.ONE_HOUR
**customAmiId**? | <code>string</code> | custom AMI ID.<br/>__*Default*__: The latest Amaozn Linux 2 AMI ID
**defaultInstanceType**? | <code>[InstanceType](#aws-cdk-aws-ec2-instancetype)</code> | default EC2 instance type.<br/>__*Default*__: t3.large
**ebsVolumeSize**? | <code>number</code> | default EBS volume size for the spot instance.<br/>__*Default*__: 60;
**eipAllocationId**? | <code>string</code> | Allocation ID for your existing Elastic IP Address.<br/>__*Optional*__
**instanceInterruptionBehavior**? | <code>[InstanceInterruptionBehavior](#cdk-spot-one-instanceinterruptionbehavior)</code> | The behavior when a Spot Instance is interrupted.<br/>__*Default*__: InstanceInterruptionBehavior.TERMINATE
**instanceProfile**? | <code>[CfnInstanceProfile](#aws-cdk-aws-iam-cfninstanceprofile)</code> | instance profile for the resource.<br/>__*Default*__: create a new one
**instanceRole**? | <code>[IRole](#aws-cdk-aws-iam-irole)</code> | IAM role for the spot instance.<br/>__*Optional*__
**keyName**? | <code>string</code> | SSH key name.<br/>__*Default*__: no ssh key will be assigned
**securityGroup**? | <code>[SecurityGroup](#aws-cdk-aws-ec2-securitygroup)</code> | Security group for the spot fleet.<br/>__*Default*__: allows TCP 22 SSH ingress rule
**targetCapacity**? | <code>number</code> | number of the target capacity.<br/>__*Default*__: 1
**terminateInstancesWithExpiration**? | <code>boolean</code> | terminate the instance when the allocation is expired.<br/>__*Default*__: true
**validFrom**? | <code>string</code> | the time when the spot fleet allocation starts.<br/>__*Default*__: no expiration
**validUntil**? | <code>string</code> | the time when the spot fleet allocation expires.<br/>__*Default*__: no expiration
**vpc**? | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | VPC for the spot fleet.<br/>__*Default*__: new VPC will be created
**vpcSubnet**? | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | VPC subnet for the spot fleet.<br/>__*Default*__: public subnet



## interface ILaunchtemplate  <a id="cdk-spot-one-ilaunchtemplate"></a>

__Implemented by__: [LaunchTemplate](#cdk-spot-one-launchtemplate)


### Methods


#### bind(spotfleet) <a id="cdk-spot-one-ilaunchtemplate-bind"></a>



```ts
bind(spotfleet: SpotFleet): SpotFleetLaunchTemplateConfig
```

* **spotfleet** (<code>[SpotFleet](#cdk-spot-one-spotfleet)</code>)  *No description*

__Returns__:
* <code>[SpotFleetLaunchTemplateConfig](#cdk-spot-one-spotfleetlaunchtemplateconfig)</code>



## struct LaunchTemplateProps  <a id="cdk-spot-one-launchtemplateprops"></a>






Name | Type | Description 
-----|------|-------------
**blockDeviceMappings**? | <code>Array<[CfnLaunchTemplate.BlockDeviceMappingProperty](#aws-cdk-aws-ec2-cfnlaunchtemplate-blockdevicemappingproperty)></code> | blockDeviceMappings for config instance.<br/>__*Default*__: from ami config.
**defaultInstanceType**? | <code>[InstanceType](#aws-cdk-aws-ec2-instancetype)</code> | __*Optional*__
**iamInstanceProfile**? | <code>[CfnInstanceProfile](#aws-cdk-aws-iam-cfninstanceprofile)</code> | __*Optional*__
**imageId**? | <code>string</code> | __*Optional*__
**instanceMarketOptions**? | <code>[CfnLaunchTemplate.InstanceMarketOptionsProperty](#aws-cdk-aws-ec2-cfnlaunchtemplate-instancemarketoptionsproperty)</code> | __*Optional*__
**keyName**? | <code>string</code> | __*Optional*__
**securityGroup**? | <code>Array<[ISecurityGroup](#aws-cdk-aws-ec2-isecuritygroup)></code> | __*Optional*__
**userData**? | <code>[UserData](#aws-cdk-aws-ec2-userdata)</code> | __*Optional*__



## struct SpotFleetLaunchTemplateConfig  <a id="cdk-spot-one-spotfleetlaunchtemplateconfig"></a>

__Obtainable from__: [LaunchTemplate](#cdk-spot-one-launchtemplate).[bind](#cdk-spot-one-launchtemplate#cdk-spot-one-launchtemplate-bind)()





Name | Type | Description 
-----|------|-------------
**launchTemplate** | <code>[ILaunchtemplate](#cdk-spot-one-ilaunchtemplate)</code> | <span></span>
**spotfleet** | <code>[SpotFleet](#cdk-spot-one-spotfleet)</code> | <span></span>



## struct SpotFleetProps  <a id="cdk-spot-one-spotfleetprops"></a>






Name | Type | Description 
-----|------|-------------
**additionalUserData**? | <code>Array<string></code> | Additional commands for user data.<br/>__*Default*__: no additional user data
**assignEip**? | <code>boolean</code> | Auto assign a new EIP on this instance if `eipAllocationId` is not defined.<br/>__*Default*__: true
**blockDeviceMappings**? | <code>Array<[CfnLaunchTemplate.BlockDeviceMappingProperty](#aws-cdk-aws-ec2-cfnlaunchtemplate-blockdevicemappingproperty)></code> | blockDeviceMappings for config instance.<br/>__*Default*__: from ami config.
**blockDuration**? | <code>[BlockDuration](#cdk-spot-one-blockduration)</code> | reservce the spot instance as spot block with defined duration.<br/>__*Default*__: BlockDuration.ONE_HOUR
**customAmiId**? | <code>string</code> | custom AMI ID.<br/>__*Default*__: The latest Amaozn Linux 2 AMI ID
**defaultInstanceType**? | <code>[InstanceType](#aws-cdk-aws-ec2-instancetype)</code> | default EC2 instance type.<br/>__*Default*__: t3.large
**ebsVolumeSize**? | <code>number</code> | default EBS volume size for the spot instance.<br/>__*Default*__: 60;
**eipAllocationId**? | <code>string</code> | Allocation ID for your existing Elastic IP Address.<br/>__*Optional*__
**instanceInterruptionBehavior**? | <code>[InstanceInterruptionBehavior](#cdk-spot-one-instanceinterruptionbehavior)</code> | The behavior when a Spot Instance is interrupted.<br/>__*Default*__: InstanceInterruptionBehavior.TERMINATE
**instanceOnly**? | <code>boolean</code> | Whether to create spot instance only instead of a fleet.<br/>__*Default*__: false;
**instanceProfile**? | <code>[CfnInstanceProfile](#aws-cdk-aws-iam-cfninstanceprofile)</code> | instance profile for the resource.<br/>__*Default*__: create a new one
**instanceRole**? | <code>[IRole](#aws-cdk-aws-iam-irole)</code> | IAM role for the spot instance.<br/>__*Optional*__
**keyName**? | <code>string</code> | SSH key name.<br/>__*Default*__: no ssh key will be assigned
**launchTemplate**? | <code>[ILaunchtemplate](#cdk-spot-one-ilaunchtemplate)</code> | Launch template for the spot fleet.<br/>__*Optional*__
**securityGroup**? | <code>[SecurityGroup](#aws-cdk-aws-ec2-securitygroup)</code> | Security group for the spot fleet.<br/>__*Default*__: allows TCP 22 SSH ingress rule
**targetCapacity**? | <code>number</code> | number of the target capacity.<br/>__*Default*__: 1
**terminateInstancesWithExpiration**? | <code>boolean</code> | terminate the instance when the allocation is expired.<br/>__*Default*__: true
**validFrom**? | <code>string</code> | the time when the spot fleet allocation starts.<br/>__*Default*__: no expiration
**validUntil**? | <code>string</code> | the time when the spot fleet allocation expires.<br/>__*Default*__: no expiration
**vpc**? | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | VPC for the spot fleet.<br/>__*Default*__: new VPC will be created
**vpcSubnet**? | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | VPC subnet for the spot fleet.<br/>__*Default*__: public subnet



## struct SpotInstanceProps  <a id="cdk-spot-one-spotinstanceprops"></a>






Name | Type | Description 
-----|------|-------------
**additionalUserData**? | <code>Array<string></code> | Additional commands for user data.<br/>__*Default*__: no additional user data
**assignEip**? | <code>boolean</code> | Auto assign a new EIP on this instance if `eipAllocationId` is not defined.<br/>__*Default*__: true
**blockDeviceMappings**? | <code>Array<[CfnLaunchTemplate.BlockDeviceMappingProperty](#aws-cdk-aws-ec2-cfnlaunchtemplate-blockdevicemappingproperty)></code> | blockDeviceMappings for config instance.<br/>__*Default*__: from ami config.
**customAmiId**? | <code>string</code> | custom AMI ID.<br/>__*Default*__: The latest Amaozn Linux 2 AMI ID
**defaultInstanceType**? | <code>[InstanceType](#aws-cdk-aws-ec2-instancetype)</code> | default EC2 instance type.<br/>__*Default*__: t3.large
**ebsVolumeSize**? | <code>number</code> | default EBS volume size for the spot instance.<br/>__*Default*__: 60;
**eipAllocationId**? | <code>string</code> | Allocation ID for your existing Elastic IP Address.<br/>__*Optional*__
**instanceInterruptionBehavior**? | <code>[InstanceInterruptionBehavior](#cdk-spot-one-instanceinterruptionbehavior)</code> | The behavior when a Spot Instance is interrupted.<br/>__*Default*__: InstanceInterruptionBehavior.TERMINATE
**instanceProfile**? | <code>[CfnInstanceProfile](#aws-cdk-aws-iam-cfninstanceprofile)</code> | instance profile for the resource.<br/>__*Default*__: create a new one
**instanceRole**? | <code>[IRole](#aws-cdk-aws-iam-irole)</code> | IAM role for the spot instance.<br/>__*Optional*__
**keyName**? | <code>string</code> | SSH key name.<br/>__*Default*__: no ssh key will be assigned
**securityGroup**? | <code>[SecurityGroup](#aws-cdk-aws-ec2-securitygroup)</code> | Security group for the spot fleet.<br/>__*Default*__: allows TCP 22 SSH ingress rule
**targetCapacity**? | <code>number</code> | number of the target capacity.<br/>__*Default*__: 1
**vpc**? | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | VPC for the spot fleet.<br/>__*Default*__: new VPC will be created
**vpcSubnet**? | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | VPC subnet for the spot fleet.<br/>__*Default*__: public subnet



## struct SpotOneProps  <a id="cdk-spot-one-spotoneprops"></a>






Name | Type | Description 
-----|------|-------------
**additionalUserData**? | <code>Array<string></code> | Additional commands for user data.<br/>__*Default*__: no additional user data
**assignEip**? | <code>boolean</code> | Auto assign a new EIP on this instance if `eipAllocationId` is not defined.<br/>__*Default*__: true
**customAmiId**? | <code>string</code> | custom AMI ID.<br/>__*Default*__: The latest Amaozn Linux 2 AMI ID
**defaultInstanceType**? | <code>[InstanceType](#aws-cdk-aws-ec2-instancetype)</code> | default EC2 instance type.<br/>__*Default*__: t3.large
**ebsVolumeSize**? | <code>number</code> | default EBS volume size for the spot instance.<br/>__*Default*__: 60;
**eipAllocationId**? | <code>string</code> | Allocation ID for your existing Elastic IP Address.<br/>__*Optional*__
**instanceInterruptionBehavior**? | <code>[InstanceInterruptionBehavior](#cdk-spot-one-instanceinterruptionbehavior)</code> | The behavior when a Spot Instance is interrupted.<br/>__*Default*__: InstanceInterruptionBehavior.TERMINATE
**instanceProfile**? | <code>[CfnInstanceProfile](#aws-cdk-aws-iam-cfninstanceprofile)</code> | instance profile for the resource.<br/>__*Default*__: create a new one
**instanceRole**? | <code>[IRole](#aws-cdk-aws-iam-irole)</code> | IAM role for the spot instance.<br/>__*Optional*__
**keyName**? | <code>string</code> | SSH key name.<br/>__*Default*__: no ssh key will be assigned
**securityGroup**? | <code>[SecurityGroup](#aws-cdk-aws-ec2-securitygroup)</code> | Security group for the spot fleet.<br/>__*Default*__: allows TCP 22 SSH ingress rule
**targetCapacity**? | <code>number</code> | number of the target capacity.<br/>__*Default*__: 1
**vpc**? | <code>[IVpc](#aws-cdk-aws-ec2-ivpc)</code> | VPC for the spot fleet.<br/>__*Default*__: new VPC will be created
**vpcSubnet**? | <code>[SubnetSelection](#aws-cdk-aws-ec2-subnetselection)</code> | VPC subnet for the spot fleet.<br/>__*Default*__: public subnet



## enum BlockDuration  <a id="cdk-spot-one-blockduration"></a>



Name | Description
-----|-----
**ONE_HOUR** |
**TWO_HOURS** |
**THREE_HOURS** |
**FOUR_HOURS** |
**FIVE_HOURS** |
**SIX_HOURS** |
**NONE** |


## enum InstanceInterruptionBehavior  <a id="cdk-spot-one-instanceinterruptionbehavior"></a>



Name | Description
-----|-----
**HIBERNATE** |
**STOP** |
**TERMINATE** |


## enum NodeType  <a id="cdk-spot-one-nodetype"></a>

Whether the worker nodes should support GPU or just standard instances.

Name | Description
-----|-----
**STANDARD** |Standard instances.
**GPU** |GPU instances.
**INFERENTIA** |Inferentia instances.
**ARM** |ARM instances.


