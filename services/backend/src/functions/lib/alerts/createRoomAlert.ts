import type {
  Alert as AlertRow,
  AlertPriority as AlertPriorityType,
} from "@prisma/client";

import { prisma } from "../prisma";
import { AlertStatus } from "../prismaClient";
import {
  lockEventRoom,
  recomputeRoomProjection,
  type RoomAlertProjection,
} from "./projection";

export type CreateRoomAlertParams = {
  eventId: string;
  roomId: string;
  priority: AlertPriorityType;
  message: string | null;
  kind?: string;
};

export type CreateRoomAlertResult = {
  alert: AlertRow;
  projection: RoomAlertProjection;
};

/**
 * Create a room alert and recompute EventRoom projection under a room row lock.
 * Callers must notify (push) only after this returns — never inside the transaction.
 */
export async function createRoomAlert(
  params: CreateRoomAlertParams,
): Promise<CreateRoomAlertResult> {
  const { eventId, roomId, priority, message, kind = "HELP" } = params;

  return prisma.$transaction(async (tx) => {
    await lockEventRoom(tx, roomId);

    const alert = await tx.alert.create({
      data: {
        eventId,
        roomId,
        kind,
        message,
        priority,
        status: AlertStatus.OPEN,
      },
    });

    const projection = await recomputeRoomProjection(tx, roomId);
    return { alert, projection };
  });
}
