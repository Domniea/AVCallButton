import { accessSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const generatedClient = join(
  backendRoot,
  "../../node_modules/.prisma/client/index.js",
);

try {
  accessSync(generatedClient);
} catch {
  console.error(
    "Missing generated Prisma client. Run from services/backend:\n  yarn prisma:generate",
  );
  process.exit(1);
}

console.log("Prisma client OK:", generatedClient);
