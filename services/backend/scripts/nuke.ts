/**
 * Drop and recreate the Prisma database, then empty non-prod S3 data buckets.
 *
 * Cognito users are left alone.
 *
 *   npm run db:nuke
 *   npm run db:nuke -- --yes
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import {
  DeleteObjectsCommand,
  GetBucketVersioningCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  ListObjectVersionsCommand,
  S3Client,
  type ObjectIdentifier,
} from "@aws-sdk/client-s3";

const backendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const region = "us-east-1";
const s3 = new S3Client({ region });

function databaseTarget(url: string): string {
  const parsed = new URL(url);
  const name = parsed.pathname.replace(/^\//, "") || "(default)";
  return `${parsed.host}/${name}`;
}

function isNukeableBucket(name: string): boolean {
  const lower = name.toLowerCase();
  if (lower.startsWith("prod-")) return false;
  if (!lower.includes("avcallbutton-backend")) return false;
  return lower.includes("uploadsbucket") || lower.includes("generatedbucket");
}

function bucketsFromSstOutputs(): string[] {
  const outputsPath = path.join(backendRoot, ".sst", "outputs.json");
  if (!fs.existsSync(outputsPath)) return [];

  const outputs = JSON.parse(fs.readFileSync(outputsPath, "utf8")) as Record<
    string,
    Record<string, unknown>
  >;
  const names: string[] = [];
  for (const stack of Object.values(outputs)) {
    if (!stack || typeof stack !== "object") continue;
    for (const [key, value] of Object.entries(stack)) {
      if (key.endsWith("BucketName") && typeof value === "string") {
        names.push(value);
      }
    }
  }
  return names;
}

async function bucketsFromAws(): Promise<string[]> {
  const listed = await s3.send(new ListBucketsCommand({}));
  return (listed.Buckets ?? [])
    .map((bucket) => bucket.Name)
    .filter((name): name is string => Boolean(name));
}

async function findBuckets(): Promise<string[]> {
  const names = new Set<string>(bucketsFromSstOutputs());
  try {
    for (const name of await bucketsFromAws()) names.add(name);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn(`Could not list S3 buckets (${message}). Using SST outputs only.`);
  }

  return [...names].filter(isNukeableBucket).sort();
}

async function deleteIds(bucket: string, ids: ObjectIdentifier[]): Promise<number> {
  let deleted = 0;
  for (let i = 0; i < ids.length; i += 1000) {
    const chunk = ids.slice(i, i + 1000);
    if (chunk.length === 0) continue;
    const result = await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: { Objects: chunk, Quiet: true },
      }),
    );
    const failure = result.Errors?.[0];
    if (failure) {
      throw new Error(
        `Failed to delete s3://${bucket}/${failure.Key}: ${failure.Code} ${failure.Message ?? ""}`.trim(),
      );
    }
    deleted += chunk.length;
  }
  return deleted;
}

async function emptyBucket(bucket: string): Promise<number> {
  let deleted = 0;
  let continuationToken: string | undefined;
  do {
    const page = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }),
    );
    const ids = (page.Contents ?? [])
      .map((object) => object.Key)
      .filter((key): key is string => Boolean(key))
      .map((Key) => ({ Key }));
    deleted += await deleteIds(bucket, ids);
    continuationToken = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (continuationToken);

  const versioning = await s3.send(
    new GetBucketVersioningCommand({ Bucket: bucket }),
  );
  const versioned =
    versioning.Status === "Enabled" || versioning.Status === "Suspended";
  if (!versioned) return deleted;

  let keyMarker: string | undefined;
  let versionIdMarker: string | undefined;
  do {
    const page = await s3.send(
      new ListObjectVersionsCommand({
        Bucket: bucket,
        KeyMarker: keyMarker,
        VersionIdMarker: versionIdMarker,
      }),
    );
    const ids: ObjectIdentifier[] = [];
    for (const version of [...(page.Versions ?? []), ...(page.DeleteMarkers ?? [])]) {
      if (version.Key && version.VersionId) {
        ids.push({ Key: version.Key, VersionId: version.VersionId });
      }
    }
    deleted += await deleteIds(bucket, ids);
    if (!page.IsTruncated) break;
    keyMarker = page.NextKeyMarker;
    versionIdMarker = page.NextVersionIdMarker;
  } while (keyMarker);

  return deleted;
}

function prismaBin(): string {
  const candidates = [
    path.join(backendRoot, "node_modules", ".bin", "prisma"),
    path.resolve(backendRoot, "../../node_modules/.bin/prisma"),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? "prisma";
}

function resetDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      prismaBin(),
      ["migrate", "reset", "--force"],
      { cwd: backendRoot, stdio: "inherit" },
    );
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`prisma migrate reset exited with code ${code ?? "unknown"}`));
    });
  });
}

async function confirm(): Promise<boolean> {
  if (process.argv.includes("--yes")) return true;
  if (!process.stdin.isTTY) {
    console.error('Refusing to nuke without a terminal. Re-run with: npm run db:nuke -- --yes');
    return false;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const answer = (await rl.question('Type "nuke" to continue: ')).trim();
  rl.close();
  return answer === "nuke";
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set. Run this from services/backend so .env loads.");
  }

  const buckets = await findBuckets();
  console.log(`Database: ${databaseTarget(databaseUrl)}`);
  if (buckets.length === 0) {
    console.log("Buckets: none found (storage stack is not deployed, or only prod exists). Skipping S3.");
  } else {
    console.log("Buckets:");
    for (const bucket of buckets) console.log(`  - ${bucket}`);
  }
  console.log("Prod buckets are never touched. Cognito users are not deleted.");

  const ok = await confirm();
  if (!ok) {
    console.log("Aborted.");
    process.exitCode = 1;
    return;
  }

  for (const bucket of buckets) {
    const deleted = await emptyBucket(bucket);
    console.log(`Emptied ${bucket} (${deleted} object${deleted === 1 ? "" : "s"})`);
  }

  console.log("Resetting database...");
  await resetDatabase();
  console.log("Nuke complete.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
