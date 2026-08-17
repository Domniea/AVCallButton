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
