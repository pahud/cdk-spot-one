const { AwsCdkConstructLibrary } = require('projen');

const PROJECT_NAME = 'cdk-spot-one';
const PROJECT_DESCRIPTION = 'One spot instance with EIP and defined duration. No interruption.';

const project = new AwsCdkConstructLibrary({
  authorName: 'Pahud Hsieh',
  authorEmail: 'pahudnet@gmail.com',
  name: PROJECT_NAME,
  description: PROJECT_DESCRIPTION,
  repository: 'https://github.com/pahud/cdk-spot-one.git',
  keywords: ['cdk', 'spot', 'aws'],
  catalog: {
    twitter: 'pahudnet',
    announce: false,
  },
  defaultReleaseBranch: 'main',
  dependabot: false,
  cdkVersion: '1.77.0',
  cdkDependencies: [
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-logs',
    '@aws-cdk/core',
    '@aws-cdk/custom-resources',
  ],
  python: {
    distName: 'cdk-spot-one',
    module: 'cdk_spot_one',
  },
});

const common_exclude = ['cdk.out', 'cdk.context.json', 'images', 'yarn-error.log'];
project.npmignore.exclude(...common_exclude);
project.gitignore.exclude(...common_exclude);

project.synth();
