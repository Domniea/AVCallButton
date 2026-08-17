import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Prisma 7 generate resolves `prisma` and `@prisma/client` with preserveSymlinks
 * and requires them to be siblings. Yarn hoists `prisma` to the repo root but
 * leaves `@prisma/client` in this workspace's node_modules, so generate fails
 * unless `prisma` is also linked here.
 */
const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const linkPath = path.join(backendRoot, "node_modules", "prisma");
const target = path.resolve(backendRoot, "../../node_modules/prisma");

if (fs.existsSync(linkPath) || !fs.existsSync(target)) {
  process.exit(0);
}

fs.symlinkSync(target, linkPath);
