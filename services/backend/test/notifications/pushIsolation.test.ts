import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = join(here, "../../src/functions");

describe("push stays outside the create transaction", () => {
  it("createRoomAlert does not import or call push/notify", () => {
    const source = readFileSync(
      join(srcRoot, "lib/alerts/createRoomAlert.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/notifyUsers|expoPush|webPush|publishAlertBoard/);
  });

  it("public createAlert notifies only after createRoomAlert awaits", () => {
    const source = readFileSync(
      join(srcRoot, "public/call/createAlert.ts"),
      "utf8",
    );
    const createIdx = source.indexOf("await createRoomAlert(");
    const notifyIdx = source.indexOf("await notifyUsers(");
    const ablyIdx = source.indexOf("await publishAlertBoardInvalidated(");

    expect(createIdx).toBeGreaterThan(-1);
    expect(notifyIdx).toBeGreaterThan(createIdx);
    expect(ablyIdx).toBeGreaterThan(createIdx);
    expect(ablyIdx).toBeLessThan(notifyIdx);
  });

  it("resolveRoomAlert soft-closes via status and never deletes", () => {
    const source = readFileSync(
      join(srcRoot, "lib/alerts/resolveRoomAlert.ts"),
      "utf8",
    );
    expect(source).toMatch(/AlertStatus\.RESOLVED/);
    expect(source).not.toMatch(/\.delete\(|deleteMany\(/);
  });
});

describe("roster AuthZ on crew alert routes", () => {
  it("resolve / alert-board / event alerts / room alerts call assertRosterEntry", () => {
    const resolveSrc = readFileSync(
      join(srcRoot, "events/alerts/resolve.ts"),
      "utf8",
    );
    const boardSrc = readFileSync(
      join(srcRoot, "me/events/alertBoard.ts"),
      "utf8",
    );
    const eventAlertsSrc = readFileSync(
      join(srcRoot, "me/events/alerts/list.ts"),
      "utf8",
    );
    const roomAlertsSrc = readFileSync(
      join(srcRoot, "me/events/rooms/alerts.ts"),
      "utf8",
    );

    for (const source of [
      resolveSrc,
      boardSrc,
      eventAlertsSrc,
      roomAlertsSrc,
    ]) {
      expect(source).toMatch(/assertRosterEntry/);
      expect(source).toMatch(/NOT_ON_ROSTER/);
    }
  });
});
