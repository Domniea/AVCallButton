import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createRoomAlert } from "../../src/functions/lib/alerts/createRoomAlert";
import { resolveRoomAlert } from "../../src/functions/lib/alerts/resolveRoomAlert";
import { prisma } from "../../src/functions/lib/prisma";
import { AlertPriority } from "../../src/functions/lib/prismaClient";
import {
  createTestEvent,
  createTestRoom,
  createTestWorkspace,
  destroyTestWorkspace,
  hasDatabase,
} from "../helpers/fixtures";

describe.skipIf(!hasDatabase)("create/resolve room alerts (integration)", () => {
  let workspaceId = "";
  let eventId = "";
  let roomId = "";

  beforeAll(async () => {
    const ctx = await createTestWorkspace();
    workspaceId = ctx.workspaceId;
    const event = await createTestEvent(ctx, { name: "Alert hardening event" });
    eventId = event.id;
    const room = await createTestRoom(eventId, { name: "Concurrency Room" });
    roomId = room.id;
  });

  afterAll(async () => {
    await destroyTestWorkspace(workspaceId);
  });

  it("handles concurrent same-room creates under room lock", async () => {
    const results = await Promise.all([
      createRoomAlert({
        eventId,
        roomId,
        priority: AlertPriority.HIGH,
        message: "concurrent-a",
      }),
      createRoomAlert({
        eventId,
        roomId,
        priority: AlertPriority.MEDIUM,
        message: "concurrent-b",
      }),
      createRoomAlert({
        eventId,
        roomId,
        priority: AlertPriority.HIGH,
        message: "concurrent-c",
      }),
    ]);

    const alertIds = new Set(results.map((r) => r.alert.id));
    expect(alertIds.size).toBe(3);

    const room = await prisma.eventRoom.findUniqueOrThrow({
      where: { id: roomId },
    });
    expect(room.activeAlertCount).toBe(3);
    expect(room.currentPriority).toBe("HIGH");
    expect(room.currentAlertId).toBeTruthy();

    const openCount = await prisma.alert.count({
      where: { roomId, status: "OPEN" },
    });
    expect(openCount).toBe(3);
  });

  it("partial resolve leaves correct color and keeps resolved rows", async () => {
    // Fresh room so counts are isolated from the concurrency case.
    const room = await prisma.eventRoom.create({
      data: {
        eventId,
        name: "Partial Resolve Room",
        sortOrder: 1,
      },
    });

    const high = await createRoomAlert({
      eventId,
      roomId: room.id,
      priority: AlertPriority.HIGH,
      message: "urgent",
    });
    const medium = await createRoomAlert({
      eventId,
      roomId: room.id,
      priority: AlertPriority.MEDIUM,
      message: "when free",
    });

    const afterHighResolve = await resolveRoomAlert({
      eventId,
      alertId: high.alert.id,
      resolvedBy: "test-user",
    });

    expect(afterHighResolve.alreadyResolved).toBe(false);
    expect(afterHighResolve.projection.currentPriority).toBe("MEDIUM");
    expect(afterHighResolve.projection.currentAlertId).toBe(medium.alert.id);
    expect(afterHighResolve.projection.activeAlertCount).toBe(1);

    const highRow = await prisma.alert.findUniqueOrThrow({
      where: { id: high.alert.id },
    });
    expect(highRow.status).toBe("RESOLVED");
    expect(highRow.resolvedBy).toBe("test-user");
    expect(highRow.resolvedAt).toBeTruthy();

    const afterLastResolve = await resolveRoomAlert({
      eventId,
      alertId: medium.alert.id,
      resolvedBy: "test-user",
    });
    expect(afterLastResolve.projection.currentPriority).toBeNull();
    expect(afterLastResolve.projection.currentAlertId).toBeNull();
    expect(afterLastResolve.projection.activeAlertCount).toBe(0);

    const mediumStillThere = await prisma.alert.findUniqueOrThrow({
      where: { id: medium.alert.id },
    });
    expect(mediumStillThere.status).toBe("RESOLVED");

    const idempotent = await resolveRoomAlert({
      eventId,
      alertId: medium.alert.id,
      resolvedBy: "test-user-2",
    });
    expect(idempotent.alreadyResolved).toBe(true);
    expect(idempotent.alert.resolvedBy).toBe("test-user");
  });
});
