import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is not set`);
  }
  return value;
}

/** User-uploaded files (room docs, later avatars). */
export function uploadsBucketName(): string {
  return requireEnv("UPLOADS_BUCKET_NAME");
}

/** App-generated files (QR packs, device configs, exports). */
export function generatedBucketName(): string {
  return requireEnv("GENERATED_BUCKET_NAME");
}

const s3 = new S3Client({});

export const UPLOAD_URL_EXPIRES_IN_SECONDS = 5 * 60;
export const DOWNLOAD_URL_EXPIRES_IN_SECONDS = 5 * 60;

export function bucketNameForEnum(bucket: "UPLOADS" | "GENERATED"): string {
  return bucket === "UPLOADS" ? uploadsBucketName() : generatedBucketName();
}

export async function presignPutObject(params: {
  bucket: string;
  key: string;
  contentType: string;
}): Promise<string> {
  return getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
      ContentType: params.contentType,
    }),
    { expiresIn: UPLOAD_URL_EXPIRES_IN_SECONDS },
  );
}

export async function presignGetObject(params: {
  bucket: string;
  key: string;
  contentType: string;
  filename: string;
}): Promise<string> {
  const safeName = params.filename.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 180);
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
      ResponseContentType: params.contentType,
      ResponseContentDisposition: `inline; filename="${safeName}"`,
    }),
    { expiresIn: DOWNLOAD_URL_EXPIRES_IN_SECONDS },
  );
}

export async function objectExists(params: {
  bucket: string;
  key: string;
}): Promise<boolean> {
  try {
    await s3.send(
      new HeadObjectCommand({ Bucket: params.bucket, Key: params.key }),
    );
    return true;
  } catch {
    return false;
  }
}
