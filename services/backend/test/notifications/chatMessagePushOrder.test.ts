import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = join(here, "../../src/functions");

describe("chat message push stays after commit", () => {
  it("create message handler notifies only after the DB transaction", () => {
    const source = readFileSync(
      join(srcRoot, "chat/threads/messages/create.ts"),
      "utf8",
    );

    const txIdx = source.indexOf("prisma.$transaction");
    const ablyIdx = source.indexOf("await publishChatMessageCreated");
    const notifyIdx = source.indexOf("void notifyChatMessageCreated");

    expect(txIdx).toBeGreaterThan(-1);
    expect(ablyIdx).toBeGreaterThan(txIdx);
    expect(notifyIdx).toBeGreaterThan(ablyIdx);
  });

  it("notifyChatMessageCreated catches errors and never rethrows", () => {
    const source = readFileSync(join(srcRoot, "lib/chat/notify.ts"), "utf8");
    expect(source).toMatch(/catch \(error\)/);
    expect(source).toMatch(/Failed to send chat push notifications/);
    expect(source).not.toMatch(/throw error/);
  });
});
