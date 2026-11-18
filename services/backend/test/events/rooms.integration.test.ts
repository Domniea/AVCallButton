import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { prisma } from "../../src/functions/lib/prisma";
import {
  createTestEvent,
  createTestRoom,
  createTestWorkspace,
  createTestZone,
  destroyTestWorkspace,
  hasDatabase,
  type TestWorkspaceContext,
} from "../helpers/fixtures";

describe.skipIf(!hasDatabase)("event rooms (integration)", () => {
  let ctx: TestWorkspaceContext;
  let eventId = "";

  beforeAll(async () => {
    ctx = await createTestWorkspace();
    const event = await createTestEvent(ctx, { name: "Rooms event" });
    eventId = event.id;
  });

  afterAll(async () => {
    await destroyTestWorkspace(ctx?.workspaceId);
  });

  it("creates rooms with call tokens and optional zone link", async () => {
    const zone = await createTestZone(eventId, { name: "North" });
    const room = await createTestRoom(eventId, {
      name: "150AB",
      zoneId: zone.id,
    });

    expect(room.callToken.length).toBeGreaterThan(0);
    expect(room.zoneId).toBe(zone.id);
    expect(room.activeAlertCount).toBe(0);
    expect(room.currentPriority).toBeNull();

    const again = await prisma.eventRoom.findUniqueOrThrow({
      where: { id: room.id },
    });
    expect(again.callToken).toBe(room.callToken);
  });
});
