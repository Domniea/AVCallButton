import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { Bucket, StackContext } from "sst/constructs";

const WEB_CORS_ORIGINS = [
  "http://localhost:3000",
  "https://av-call-button-web.vercel.app",
];

const UPLOAD_CORS = [
  {
    allowedHeaders: ["*"],
    allowedMethods: ["GET", "PUT", "HEAD"] as ("GET" | "PUT" | "HEAD")[],
    allowedOrigins: WEB_CORS_ORIGINS,
    exposedHeaders: ["ETag"],
  },
];

/**
 * Private S3 buckets. Objects are not public — APIs will issue presigned URLs.
 *
 * - Uploads: user files (room docs/schematics, later avatars)
 * - Generated: app-created files (QR packs, device configs, exports)
 */
export function StorageStack({ stack, app }: StackContext) {
  const isProd = app.stage === "prod";
  const cdkBucket = {
    autoDeleteObjects: !isProd,
    removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    lifecycleRules: [
      { abortIncompleteMultipartUploadAfter: Duration.days(7) },
    ],
  };

  const uploads = new Bucket(stack, "Uploads", {
    cors: UPLOAD_CORS,
    cdk: { bucket: cdkBucket },
  });

  const generated = new Bucket(stack, "Generated", {
    cors: UPLOAD_CORS,
    cdk: { bucket: cdkBucket },
  });

  stack.addOutputs({
    UploadsBucketName: uploads.bucketName,
    GeneratedBucketName: generated.bucketName,
  });

  return { uploads, generated };
}
