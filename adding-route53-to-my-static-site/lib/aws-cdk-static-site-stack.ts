import * as cdk from '@aws-cdk/core';
import * as s3 from "@aws-cdk/aws-s3";
import * as s3Deploy from "@aws-cdk/aws-s3-deployment";
import * as cloudfront from "@aws-cdk/aws-cloudfront";
import * as origins from "@aws-cdk/aws-cloudfront-origins";
import * as route53 from "@aws-cdk/aws-route53";
import * as route53Targets from "@aws-cdk/aws-route53-targets";
import * as acm from "@aws-cdk/aws-certificatemanager";

export class AwsCdkStaticSiteStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "Bucket", {
      bucketName: "mattmurr-aws-cdk-static-site",
      autoDeleteObjects: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    new cdk.CfnOutput(this, "BucketURL", { value: bucket.bucketWebsiteUrl });

    const zone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: "<domain-name>",
    });
    
    const certificate = new acm.DnsValidatedCertificate(this, "SiteCertificate", {
      domainName: "<domain-name>",
      hostedZone: zone,
      region: "us-east-1",
    });

    const distribution = new cloudfront.Distribution(this, "SiteDistribution", {
      defaultBehavior: {
        origin: new origins.S3Origin(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: "index.html",
      domainNames: ["<domain-name>"],
      certificate: certificate
    });

    new route53.ARecord(this, "SiteARecord", {
      recordName: "<domain-name>",
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
      zone,
    });
    
    new s3Deploy.BucketDeployment(this, "BucketDeployment", {
      sources: [s3Deploy.Source.asset("./site")],
      destinationBucket: bucket,
      distribution,
      distributionPaths: ["/*"]
    });

    new cdk.CfnOutput(this, "DistributionDomainName", {
      value: "https://" + distribution.domainName,
    });
  }
}
