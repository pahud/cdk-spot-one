import * as ec2 from '@aws-cdk/aws-ec2';
import { Construct, Resource, ResourceProps, PhysicalName, Stack, Fn, CfnOutput, Duration, Lazy, CustomResource, Token } from '@aws-cdk/core';
import * as iam from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda';
import * as logs from '@aws-cdk/aws-logs';
import * as cr from '@aws-cdk/custom-resources';
import * as path from 'path';

const DEFAULT_INSTANCE_TYPE = 't3.large'

export class VpcProvider extends Stack {
  public static getOrCreate(scope: Construct) {
    const stack = Stack.of(scope)
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
  SIX_HOURS = 360
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
  readonly spotfleet: SpotFleet
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
    }
  }
}

export interface BaseSpotFleetProps extends ResourceProps {
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
   * reservce the spot instance as spot block with defined duration
   * 
   * @default - BlockDuration.ONE_HOUR
   */
  readonly blockDuration?: BlockDuration;

  /**
   * The behavior when a Spot Instance is interrupted
   * 
   * @default - InstanceInterruptionBehavior.TERMINATE
   */
  readonly instanceInterruptionBehavior?: InstanceInterruptionBehavior;

  /**
   * IAM role for the spot instance
   */
  readonly instanceRole?: iam.Role;

  /**
   * number of the target capacity
   * 
   * @default - 1
   */
  readonly targetCapacity?: number;

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
   * custom AMI ID
   * 
   * @default - The latest Amaozn Linux 2 AMI ID
   */
  readonly customAmiId?: string;

  /**
   * VPC subnet for the spot fleet
   * 
   * @default - public subnet
   */
  readonly vpcSubnet?: ec2.SubnetSelection;

  /**
   * SSH key name
   * 
   * @default - no ssh key will be assigned
   */
  readonly keyName?: string;

}

export interface SpotFleetProps extends BaseSpotFleetProps {
  /**
   * Launch template for the spot fleet
   */
  readonly launchTemplate?: ILaunchtemplate;

  /**
   * Allocation ID for your existing Elastic IP Address. 
   * 
   * @defalt new EIP and its association will be created for the first instance in this spot fleet
   */
  readonly eipAllocationId?: string;

}

export class SpotFleet extends Resource {
  readonly instanceRole: iam.IRole;
  readonly defaultInstanceType: ec2.InstanceType;
  readonly targetCapacity?: number;
  readonly spotFleetId: string;
  readonly launchTemplate: ILaunchtemplate;
  readonly vpc: ec2.IVpc;
  /**
   * the first instance id in this fleet
   */
  readonly instanceId: string;
  /**
   * instance type of the first instance in this fleet
   */
  readonly instanceType: string;
  /**
   * SpotFleetRequestId for this spot fleet
   */
  readonly spotFleetRequestId: string;
  /**
   * The time when the the fleet allocation will expire
   */
  private validUntil?: string;
  /**
   * @default - open SSH 22 port Any IP .
   */
  public readonly defaultSecurityGroup: ec2.ISecurityGroup; 

  constructor(scope: Construct, id: string, props: SpotFleetProps = {}) {
    super(scope, id, props)

    this.spotFleetId = id
    this.launchTemplate = props.launchTemplate ?? new LaunchTemplate()
    this.targetCapacity = props.targetCapacity ?? 1
    this.defaultInstanceType = props.defaultInstanceType ?? new ec2.InstanceType(DEFAULT_INSTANCE_TYPE)
    this.validUntil = props.validUntil 
    this.vpc = props.vpc ?? new ec2.Vpc(this, 'VPC', { maxAzs: 3, natGateways: 1})
    
    // isntance role
    this.instanceRole = props.instanceRole || new iam.Role(this, 'InstanceRole', {
      roleName: PhysicalName.GENERATE_IF_NEEDED,
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
    });

    this.instanceRole.addToPolicy(new iam.PolicyStatement({
      actions: [
        'ssmmessages:*',
        'ssm:UpdateInstanceInformation',
        'ec2messages:*',
      ],
      resources: ['*'],
    }));

    const instanceProfile = new iam.CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [this.instanceRole.roleName],
    })

    this.defaultSecurityGroup = new ec2.SecurityGroup(this, 'SpotFleetSg', {
      vpc: this.vpc,
    })

    this.defaultSecurityGroup.connections.allowFromAnyIpv4(ec2.Port.tcp(22))

    this.defaultInstanceType = props.defaultInstanceType ?? new ec2.InstanceType(DEFAULT_INSTANCE_TYPE)

    const imageId = props.customAmiId ?? 
      ec2.MachineImage.latestAmazonLinux({ 
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
        cpuType: nodeTypeForInstanceType(this.defaultInstanceType) === NodeType.ARM ? ec2.AmazonLinuxCpuType.ARM_64 : undefined,
      }).getImage(this).imageId


    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'yum install -y https://s3.amazonaws.com/ec2-downloads-windows/SSMAgent/latest/linux_amd64/amazon-ssm-agent.rpm',
      'yum install -y docker',
      'usermod -aG docker ec2-user',
      'usermod -aG docker ssm-user',
      'service docker start',
    );
    const lt = new ec2.CfnLaunchTemplate(this, 'LaunchTemplate', {
      launchTemplateData: {
        imageId,
        instanceType: this.defaultInstanceType.toString(),
        userData: Fn.base64(userData.render()),
        keyName: props.keyName,
        tagSpecifications: [
          {
            resourceType: 'instance',
            tags: [
              {
                key: 'Name',
                value: `${Stack.of(this).stackName}/spotFleet/${this.spotFleetId}`,
              },
            ],
          },
        ],
        instanceMarketOptions: {
          marketType: 'spot',
          spotOptions: {
            blockDurationMinutes: props.blockDuration ?? BlockDuration.ONE_HOUR,
            instanceInterruptionBehavior: props.instanceInterruptionBehavior ?? InstanceInterruptionBehavior.TERMINATE,
          },
        },
        securityGroupIds: this.defaultSecurityGroup.connections.securityGroups.map(m => m.securityGroupId),
        iamInstanceProfile: {
          arn: instanceProfile.attrArn,
        },
      },
    })

    const spotFleetRole = new iam.Role(this, 'FleetRole', {
      assumedBy: new iam.ServicePrincipal('spotfleet.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonEC2SpotFleetTaggingRole'),
      ],
    })

    const vpcSubnetSelection = props.vpcSubnet ?? {
      subnetType: ec2.SubnetType.PUBLIC,
    }
    const subnetConfig = this.vpc.selectSubnets(vpcSubnetSelection).subnets.map(s => ({
      subnetId: s.subnetId,
    }))
    const cfnSpotFleet = new ec2.CfnSpotFleet(this, id, {
      spotFleetRequestConfigData: {
        launchTemplateConfigs: [
          {
            launchTemplateSpecification: {
              launchTemplateId: lt.ref,
              version: lt.attrLatestVersionNumber,
            },
            overrides: subnetConfig,
          },
        ],
        iamFleetRole: spotFleetRole.roleArn,
        targetCapacity: props.targetCapacity ?? 1,
        validFrom: props.validFrom,
        validUntil: Lazy.stringValue({ produce: () => this.validUntil }),
        terminateInstancesWithExpiration: props.terminateInstancesWithExpiration ?? true,
      },
    })
    new CfnOutput(this, 'SpotFleetId', { value: cfnSpotFleet.ref })
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
      isCompleteHandler: isComplete,        // optional async "waiter"
      logRetention: logs.RetentionDays.ONE_DAY,   // default is INFINITE
    });

    onEvent.addToRolePolicy(new iam.PolicyStatement({
      actions: [ 'ec2:DescribeSpotFleetInstances' ],
      resources: [ '*' ],
    }))

    const fleetInstances = new CustomResource(this, 'SpotFleetInstances', { 
      serviceToken: myProvider.serviceToken,
      properties: {
        SpotFleetRequestId: cfnSpotFleet.ref,
      }, 
    });

    fleetInstances.node.addDependency(cfnSpotFleet)

    this.instanceId = Token.asString(fleetInstances.getAtt('InstanceId'))
    this.instanceType = Token.asString(fleetInstances.getAtt('InstanceType'))
    this.spotFleetRequestId = Token.asString(fleetInstances.getAtt('SpotInstanceRequestId'))

    new CfnOutput(this, 'InstanceId', { value: this.instanceId })

    // EIP association
    if (props.eipAllocationId) {
      new ec2.CfnEIPAssociation(this, 'EipAssocation', {
        allocationId: props.eipAllocationId,
        instanceId: this.instanceId,
      })
    } else {
      new ec2.CfnEIP(this, 'EIP', {
        instanceId: this.instanceId,
      })
    }
  }
  public expireAfter(duration: Duration) {
    const date = new Date();
    date.setSeconds(date.getSeconds() + duration.toSeconds());
    this.validUntil = date.toISOString();
  }
}


const GRAVITON_INSTANCETYPES = ['a1'];
const GRAVITON2_INSTANCETYPES = ['c6g', 'm6g', 'r6g'];
const GPU_INSTANCETYPES = ['p2', 'p3', 'g4'];
const INFERENTIA_INSTANCETYPES = ['inf1'];

function nodeTypeForInstanceType(instanceType: ec2.InstanceType) {
  return GPU_INSTANCETYPES.includes(instanceType.toString().substring(0, 2)) ? NodeType.GPU :
    INFERENTIA_INSTANCETYPES.includes(instanceType.toString().substring(0, 4)) ? NodeType.INFERENTIA :
      GRAVITON2_INSTANCETYPES.includes(instanceType.toString().substring(0, 3)) ? NodeType.ARM :
        GRAVITON_INSTANCETYPES.includes(instanceType.toString().substring(0, 2)) ? NodeType.ARM :
          NodeType.STANDARD;
}
