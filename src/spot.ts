import * as path from 'path';
import * as ec2 from '@aws-cdk/aws-ec2';
import { IMachineImage } from '@aws-cdk/aws-ec2';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import { Construct, PhysicalName, Stack, Fn, CfnOutput, Duration, Lazy, CustomResource, Token } from '@aws-cdk/core';
import * as cr from '@aws-cdk/custom-resources';

const DEFAULT_INSTANCE_TYPE = 't3.large';

export class VpcProvider extends Stack {
  public static getOrCreate(scope: Construct) {
    const stack = Stack.of(scope);
    return stack.node.tryGetContext('use_default_vpc') === '1' ?
      ec2.Vpc.fromLookup(stack, 'Vpc', { isDefault: true }) :
      stack.node.tryGetContext('use_vpc_id') ?
        ec2.Vpc.fromLookup(stack, 'Vpc', { vpcId: stack.node.tryGetContext('use_vpc_id') }) :
        new ec2.Vpc(stack, 'Vpc', { maxAzs: 3, natGateways: 1 });
  }
}

export enum BlockDuration {
  ONE_HOUR = 60,
  TWO_HOURS = 120,
  THREE_HOURS = 180,
  FOUR_HOURS = 240,
  FIVE_HOURS = 300,
  SIX_HOURS = 360,
  NONE = 0,
}

/**
 * Whether the worker nodes should support GPU or just standard instances
 */
export enum NodeType {
  /**
   * Standard instances
   */
  STANDARD = 'Standard',

  /**
   * GPU instances
   */
  GPU = 'GPU',

  /**
   * Inferentia instances
   */
  INFERENTIA = 'INFERENTIA',

  /**
   * ARM instances
   */
  ARM = 'ARM',


}

export enum InstanceInterruptionBehavior {
  HIBERNATE = 'hibernate',
  STOP = 'stop',
  TERMINATE = 'terminate'
}

export interface SpotFleetLaunchTemplateConfig {
  readonly spotfleet: SpotFleet;
  readonly launchTemplate: ILaunchtemplate;
}

export interface ILaunchtemplate {
  bind(spotfleet: SpotFleet): SpotFleetLaunchTemplateConfig;
}

export class LaunchTemplate implements ILaunchtemplate {
  public bind(spotfleet: SpotFleet): SpotFleetLaunchTemplateConfig {
    return {
      spotfleet,
      launchTemplate: this,
    };
  }
}

export interface SpotOneProps {
  /**
   * VPC for the spot fleet
   *
   * @default - new VPC will be created
   *
   */
  readonly vpc?: ec2.IVpc;

  /**
   * default EC2 instance type
   *
   * @default - t3.large
   */
  readonly defaultInstanceType?: ec2.InstanceType;

  /**
   * The behavior when a Spot Instance is interrupted
   *
   * @default - InstanceInterruptionBehavior.TERMINATE
   */
  readonly instanceInterruptionBehavior?: InstanceInterruptionBehavior;

  /**
   * IAM role for the spot instance
   */
  readonly instanceRole?: iam.IRole;

  /**
   * number of the target capacity
   *
   * @default - 1
   */
  readonly targetCapacity?: number;

  /**
   * custom AMI ID
   *
   * @default - The latest Amaozn Linux 2 AMI ID
   */
  readonly customAmiId?: IMachineImage;

  /**
   * VPC subnet for the spot fleet
   *
   * @default - public subnet
   */
  readonly vpcSubnet?: ec2.SubnetSelection;

  /**
   * Security group for the spot fleet
   *
   * @default - allows TCP 22 SSH ingress rule
   */
  readonly securityGroup?: ec2.SecurityGroup;

  /**
   * SSH key name
   *
   * @default - no ssh key will be assigned
   */
  readonly keyName?: string;

  /**
   * Additional commands for user data
   *
   * @default - no additional user data
   */
  readonly additionalUserData?: string[];

  /**
   * Allocation ID for your existing Elastic IP Address.
   *
   * @defalt new EIP and its association will be created for the first instance in this spot fleet
   */
  readonly eipAllocationId?: string;

  /**
   * Auto assign a new EIP on this instance if `eipAllocationId` is not defined
   *
   * @default true
   */
  readonly assignEip?: boolean;

  /**
   * default EBS volume size for the spot instance
   *
   * @default 60;
   */
  readonly ebsVolumeSize?: number;

  /**
   * instance profile for the resource
   *
   * @default - create a new one
   */
  readonly instanceProfile?: iam.CfnInstanceProfile;
}

export abstract class SpotOne extends Construct {
  readonly vpc: ec2.IVpc;
  /**
   * The default security group of the instance, which only allows TCP 22 SSH ingress rule.
   */
  readonly defaultSecurityGroup: ec2.ISecurityGroup;
  readonly instanceId?: string;
  readonly instanceType?: string;
  readonly defaultInstanceType: ec2.InstanceType;
  readonly imageId: IMachineImage;
  readonly userData: ec2.UserData;
  protected instanceRole?: iam.IRole;
  protected instanceProfile?: iam.CfnInstanceProfile;

  constructor(scope: Construct, id: string, props: SpotOneProps) {
    super(scope, id);

    this.vpc = props.vpc ?? VpcProvider.getOrCreate(this);
    this.defaultSecurityGroup = props.securityGroup || this.createSecurityGroup();
    this.instanceProfile = props.instanceProfile;
    this.defaultInstanceType = props.defaultInstanceType ?? new ec2.InstanceType(DEFAULT_INSTANCE_TYPE);

    this.imageId = props.customAmiId ??
      ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        cpuType: nodeTypeForInstanceType(this.defaultInstanceType) === NodeType.ARM ? ec2.AmazonLinuxCpuType.ARM_64 : undefined,
      });

    this.userData = ec2.UserData.forLinux();

    /**
     * If not using custom AMI, we use amazon linux 2 and install the SSM agent and enable docker by default.
     * Otherwise, we simply do nothing here.
     */
    if (props.customAmiId == undefined) {
      this.userData.addCommands(
        'yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm',
        'yum install -y docker',
        'usermod -aG docker ec2-user',
        'usermod -aG docker ssm-user',
        'service docker start',
      );
    }

    if (props.additionalUserData) { this.userData.addCommands(...props.additionalUserData); }

    this.associateEip(props);
  }
  protected createInstanceRole(): iam.IRole {
    this.instanceRole = new iam.Role(this, 'InstanceRole', {
      roleName: PhysicalName.GENERATE_IF_NEEDED,
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });
    this.instanceRole.addManagedPolicy({
      managedPolicyArn: 'arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore',
    });
    return this.instanceRole;
  }
  protected createSecurityGroup(): ec2.SecurityGroup {
    const securityGroup = new ec2.SecurityGroup(this, 'SpotFleetSg', {
      vpc: this.vpc,
    });
    securityGroup.connections.allowFromAnyIpv4(ec2.Port.tcp(22));
    return securityGroup;
  }
  protected associateEip(props: SpotOneProps) {
    // EIP association
    if (props.eipAllocationId) {
      new ec2.CfnEIPAssociation(this, 'EipAssocation', {
        allocationId: props.eipAllocationId,
        instanceId: this.instanceId,
      });
    } else if (props.assignEip !== false) {
      new ec2.CfnEIP(this, 'EIP', {
        instanceId: this.instanceId,
      });
    }
  }
  protected createInstanceProfile(role: iam.IRole): iam.CfnInstanceProfile {
    return new iam.CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [role.roleName],
    });
  }
}


export interface SpotInstanceProps extends SpotOneProps {}

export class SpotInstance extends SpotOne {
  readonly instanceId?: string;
  readonly instanceType?: string;
  constructor(scope: Construct, id: string, props: SpotInstanceProps = {}) {
    super(scope, id, props);

    const spotInstance = new ec2.Instance(this, 'SpotInstance', {
      vpc: this.vpc,
      instanceType: this.defaultInstanceType,
      machineImage: this.imageId,
      keyName: props.keyName,
      securityGroup: this.defaultSecurityGroup,
      role: this.instanceRole,
      userData: this.userData,
      vpcSubnets: props.vpcSubnet ?? {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(props.ebsVolumeSize ?? 60),
        },
      ],
    });
    const cfnInstance = spotInstance.node.defaultChild as ec2.CfnInstance;
    // create custom launch template reousrce
    const launchTemplate = new LaunchTemplateResource(this, 'launchTemplateForInstance', {
      instanceMarketOptions: {
        marketType: 'spot',
        spotOptions: {
          instanceInterruptionBehavior: props.instanceInterruptionBehavior,
          spotInstanceType: props.instanceInterruptionBehavior === InstanceInterruptionBehavior.TERMINATE ? 'one-time'
            : 'persistent',
        },
      },
      iamInstanceProfile: this.instanceProfile,
    });
    cfnInstance.addPropertyOverride('LaunchTemplate', {
      LaunchTemplateId: launchTemplate.resource.ref,
      Version: launchTemplate.resource.attrLatestVersionNumber,
    });
    // As we can't specify IamInstanceProfile both in launch template and instane property
    // we need delete the property here.
    cfnInstance.addPropertyDeletionOverride('IamInstanceProfile');

    this.instanceId = spotInstance.instanceId;
    this.instanceType = this.defaultInstanceType.toString();
    new CfnOutput(this, 'PublicIpAddress', { value: cfnInstance.attrPublicIp });
  }
}

export interface BaseSpotFleetProps extends SpotOneProps {
  /**
   * reservce the spot instance as spot block with defined duration
   *
   * @default - BlockDuration.ONE_HOUR
   */
  readonly blockDuration?: BlockDuration;

  /**
   * the time when the spot fleet allocation starts
   *
   * @default - no expiration
   */
  readonly validFrom?: string;

  /**
   * the time when the spot fleet allocation expires
   *
   * @default - no expiration
   */
  readonly validUntil?: string;

  /**
   * terminate the instance when the allocation is expired
   *
   * @default - true
   */
  readonly terminateInstancesWithExpiration?: boolean;

  /**
   * blockDeviceMappings for config instance.
   *
   * @default - from ami config.
   */
  readonly blockDeviceMappings?: ec2.CfnLaunchTemplate.BlockDeviceMappingProperty[] | undefined;
}

export interface SpotFleetProps extends BaseSpotFleetProps {
  /**
   * Launch template for the spot fleet
   */
  readonly launchTemplate?: ILaunchtemplate;

  /**
   * Whether to create spot instance only instead of a fleet.
   *
   * @default false;
   */
  readonly instanceOnly?: boolean;
}

export class SpotFleet extends SpotOne {
  // readonly instanceRole: iam.IRole;
  // readonly defaultInstanceType: ec2.InstanceType;
  readonly targetCapacity?: number;
  readonly spotFleetId: string;
  readonly launchTemplate: ILaunchtemplate;
  // readonly vpc: ec2.IVpc;
  /**
   * the first instance id in this fleet
   */
  readonly instanceId?: string;
  /**
   * instance type of the first instance in this fleet
   */
  readonly instanceType?: string;
  /**
   * SpotFleetRequestId for this spot fleet
   */
  readonly spotFleetRequestId?: string;
  /**
   * The behavior when a Spot Instance is interrupted
   *
   * @default terminate
   */
  readonly instanceInterruptionBehavior?: InstanceInterruptionBehavior;
  /**
   * The time when the the fleet allocation will expire
   */
  private validUntil?: string;


  constructor(scope: Construct, id: string, props: SpotFleetProps = {}) {
    super(scope, id, props);
    this.spotFleetId = id;
    this.launchTemplate = props.launchTemplate ?? new LaunchTemplate();
    this.targetCapacity = props.targetCapacity ?? 1;
    this.validUntil = props.validUntil;

    const stack = Stack.of(this);

    this.instanceProfile = props.instanceProfile ?? props.instanceRole ? this.createInstanceProfile(props.instanceRole!)
      : this.createInstanceProfile(this.createInstanceRole());

    const lt = new LaunchTemplateResource(this, 'LaunchTemplate', {
      blockDeviceMappings: props.blockDeviceMappings,
      defaultInstanceType: this.defaultInstanceType,
      iamInstanceProfile: this.instanceProfile,
      imageId: this.imageId,
      instanceMarketOptions: {
        marketType: 'spot',
        spotOptions: {
          blockDurationMinutes: (props.blockDuration == BlockDuration.NONE) ? undefined : (props.blockDuration ?? BlockDuration.ONE_HOUR),
          instanceInterruptionBehavior: props.instanceInterruptionBehavior ?? InstanceInterruptionBehavior.TERMINATE,
        },
      },
      keyName: props.keyName,
      securityGroup: this.defaultSecurityGroup.connections.securityGroups,
      userData: this.userData,
    });

    const spotFleetRole = new iam.Role(this, 'FleetRole', {
      assumedBy: new iam.ServicePrincipal('spotfleet.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2SpotFleetTaggingRole'),
      ],
    });

    const vpcSubnetSelection = props.vpcSubnet ?? {
      subnetType: ec2.SubnetType.PUBLIC,
    };
    const subnetConfig = this.vpc.selectSubnets(vpcSubnetSelection).subnets.map(s => ({
      subnetId: s.subnetId,
    }));

    const cfnSpotFleet = new ec2.CfnSpotFleet(this, id, {
      spotFleetRequestConfigData: {
        launchTemplateConfigs: [
          {
            launchTemplateSpecification: {
              launchTemplateId: lt.resource.ref,
              version: lt.resource.attrLatestVersionNumber,
            },
            overrides: subnetConfig,
          },
        ],
        iamFleetRole: spotFleetRole.roleArn,
        targetCapacity: props.targetCapacity ?? 1,
        validFrom: props.validFrom,
        validUntil: Lazy.string({ produce: () => this.validUntil }),
        terminateInstancesWithExpiration: props.terminateInstancesWithExpiration ?? true,
        instanceInterruptionBehavior: props.instanceInterruptionBehavior ?? InstanceInterruptionBehavior.TERMINATE,
      },
    });
    new CfnOutput(stack, 'SpotFleetId', { value: cfnSpotFleet.ref });
    const onEvent = new lambda.Function(this, 'OnEvent', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../eip-handler')),
      handler: 'index.on_event',
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: Duration.seconds(60),
    });

    const isComplete = new lambda.Function(this, 'IsComplete', {
      code: lambda.Code.fromAsset(path.join(__dirname, '../eip-handler')),
      handler: 'index.is_complete',
      runtime: lambda.Runtime.PYTHON_3_8,
      timeout: Duration.seconds(60),
      role: onEvent.role,
    });

    const myProvider = new cr.Provider(this, 'MyProvider', {
      onEventHandler: onEvent,
      isCompleteHandler: isComplete, // optional async "waiter"
      logRetention: logs.RetentionDays.ONE_DAY, // default is INFINITE
    });

    onEvent.addToRolePolicy(new iam.PolicyStatement({
      actions: ['ec2:DescribeSpotFleetInstances'],
      resources: ['*'],
    }));

    const fleetInstances = new CustomResource(this, 'SpotFleetInstances', {
      serviceToken: myProvider.serviceToken,
      properties: {
        SpotFleetRequestId: cfnSpotFleet.ref,
      },
    });

    fleetInstances.node.addDependency(cfnSpotFleet);

    this.instanceId = Token.asString(fleetInstances.getAtt('InstanceId'));
    this.instanceType = Token.asString(fleetInstances.getAtt('InstanceType'));
    this.spotFleetRequestId = Token.asString(fleetInstances.getAtt('SpotInstanceRequestId'));
    new CfnOutput(stack, 'InstanceId', { value: this.instanceId });
  }
  public expireAfter(duration: Duration) {
    const date = new Date();
    date.setSeconds(date.getSeconds() + duration.toSeconds());
    this.validUntil = date.toISOString();
  }
}

export interface LaunchTemplateProps {
  readonly imageId?: IMachineImage;
  readonly defaultInstanceType?: ec2.InstanceType;
  readonly keyName?: string;
  readonly userData?: ec2.UserData;
  /**
   * blockDeviceMappings for config instance.
   *
   * @default - from ami config.
   */
  readonly blockDeviceMappings?: ec2.CfnLaunchTemplate.BlockDeviceMappingProperty[] | undefined;
  readonly instanceMarketOptions?: ec2.CfnLaunchTemplate.InstanceMarketOptionsProperty;
  readonly securityGroup?: ec2.ISecurityGroup[];
  readonly iamInstanceProfile?: iam.CfnInstanceProfile;
}

export class LaunchTemplateResource extends Construct {
  readonly defaultInstanceType: ec2.InstanceType;
  readonly resource: ec2.CfnLaunchTemplate;
  constructor(scope: Construct, id: string, props: LaunchTemplateProps = {}) {
    super(scope, id);

    this.defaultInstanceType = props.defaultInstanceType ?? new ec2.InstanceType(DEFAULT_INSTANCE_TYPE);
    const imageId = props.imageId ??
      ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        cpuType: nodeTypeForInstanceType(this.defaultInstanceType) === NodeType.ARM ? ec2.AmazonLinuxCpuType.ARM_64 : undefined,
      }).getImage(this).imageId;

    const userData = props.userData ?? ec2.UserData.forLinux();

    this.resource = new ec2.CfnLaunchTemplate(this, 'LaunchTemplate', {
      launchTemplateData: {
        imageId: imageId.toString(),
        instanceType: this.defaultInstanceType.toString(),
        userData: Fn.base64(userData.render()),
        keyName: props.keyName,
        tagSpecifications: [
          {
            resourceType: 'instance',
            tags: [
              {
                key: 'Name',
                value: `${Stack.of(this).stackName}/${id}`,
              },
            ],
          },
        ],
        blockDeviceMappings: props.blockDeviceMappings ?? undefined,
        instanceMarketOptions: props.instanceMarketOptions,
        securityGroupIds: props.securityGroup?.map(s => s.securityGroupId),
        iamInstanceProfile: props.iamInstanceProfile ? {
          arn: props.iamInstanceProfile.attrArn,
        } : undefined,
      },
    });
  }
}

const GRAVITON_INSTANCETYPES = ['a1'];
const GRAVITON2_INSTANCETYPES = ['c6g', 'm6g', 'r6g', 'x2gd'];
const GPU_INSTANCETYPES = ['p2', 'p3', 'g4'];
const INFERENTIA_INSTANCETYPES = ['inf1'];

function nodeTypeForInstanceType(instanceType: ec2.InstanceType) {
  return GPU_INSTANCETYPES.includes(instanceType.toString().substring(0, 2)) ? NodeType.GPU :
    INFERENTIA_INSTANCETYPES.includes(instanceType.toString().substring(0, 4)) ? NodeType.INFERENTIA :
      GRAVITON2_INSTANCETYPES.includes(instanceType.toString().substring(0, 3)) ? NodeType.ARM :
        GRAVITON_INSTANCETYPES.includes(instanceType.toString().substring(0, 2)) ? NodeType.ARM :
          NodeType.STANDARD;
}
