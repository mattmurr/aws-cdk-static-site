import * as cdk from '@aws-cdk/core';
import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deploy from "@aws-cdk/aws-s3-deployment";

export class AwsCdkStaticSiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Bucket", {
      bucketName: "mattmurr-aws-cdk-static-site",
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    new s3Deploy.BucketDeployment(this, "BucketDeployment", {
      // Source our site files from `./site` dir
      sources: [s3Deploy.Source.asset("./site")],
      destinationBucket: bucket,
    });

    new cdk.CfnOutput(this, "BucketURL", { value: bucket.bucketWebsiteUrl });
  }
}
