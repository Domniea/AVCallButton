import type { Alert as AlertRow } from "@prisma/client";

import { prisma } from "../prisma";
import { AlertStatus } from "../prismaClient";
import {
  lockEventRoom,
  recomputeRoomProjection,
  type RoomAlertProjection,
} from "./projection";

export type ResolveRoomAlertParams = {
  eventId: string;
  alertId: string;
  resolvedBy: string;
};

export type ResolveRoomAlertResult = {
  alert: AlertRow;
  projection: RoomAlertProjection;
  alreadyResolved: boolean;
};

/**
 * Soft-resolve an alert and recompute room projection under a room row lock.
 * Idempotent: resolving an already-RESOLVED alert returns success without mutating.
 */
export async function resolveRoomAlert(
  params: ResolveRoomAlertParams,
): Promise<ResolveRoomAlertResult> {
  const { eventId, alertId, resolvedBy } = params;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.alert.findFirst({
      where: { id: alertId, eventId },
      select: { id: true, roomId: true, status: true },
    });
    if (!existing) {
      throw new Error("ALERT_NOT_FOUND");
    }

    await lockEventRoom(tx, existing.roomId);

    const alert = await tx.alert.findFirst({
      where: { id: alertId, eventId },
    });
    if (!alert) {
      throw new Error("ALERT_NOT_FOUND");
    }

    if (alert.status === AlertStatus.RESOLVED) {
      const room = await tx.eventRoom.findUniqueOrThrow({
        where: { id: alert.roomId },
        select: {
          currentPriority: true,
          currentAlertId: true,
          activeAlertCount: true,
          statusUpdatedAt: true,
        },
      });
      return {
        alert,
        projection: {
          currentPriority: room.currentPriority,
          currentAlertId: room.currentAlertId,
          activeAlertCount: room.activeAlertCount,
          statusUpdatedAt: room.statusUpdatedAt,
        },
        alreadyResolved: true,
      };
    }

    const updated = await tx.alert.update({
      where: { id: alert.id },
      data: {
        status: AlertStatus.RESOLVED,
        resolvedAt: new Date(),
        resolvedBy,
      },
    });

    const projection = await recomputeRoomProjection(tx, alert.roomId);
    return { alert: updated, projection, alreadyResolved: false };
  });
}
