import type { AlertPriority as AlertPriorityType } from "@prisma/client";

import { AlertPriority, AlertStatus, Prisma } from "../prismaClient";
import type { PrismaTransactionClient } from "../workspaceRoles";

/** OPEN + ACKNOWLEDGED count as active; ack does not clear room color. */
export const ACTIVE_ALERT_STATUSES = [
  AlertStatus.OPEN,
  AlertStatus.ACKNOWLEDGED,
] as const;

export type RoomAlertProjection = {
  currentPriority: AlertPriorityType | null;
  currentAlertId: string | null;
  activeAlertCount: number;
  statusUpdatedAt: Date | null;
};

export type ActiveAlertForProjection = {
  id: string;
  priority: AlertPriorityType;
  createdAt: Date;
};

const priorityRank: Record<AlertPriorityType, number> = {
  [AlertPriority.HIGH]: 0,
  [AlertPriority.MEDIUM]: 1,
};

export function isActiveAlertStatus(status: string): boolean {
  return (ACTIVE_ALERT_STATUSES as readonly string[]).includes(status);
}

/**
 * Pure projection rules: HIGH outranks MEDIUM; driving = oldest at that priority.
 * Used by DB recompute and unit tests.
 */
export function computeProjectionFromActiveAlerts(
  active: ActiveAlertForProjection[],
): Pick<
  RoomAlertProjection,
  "currentPriority" | "currentAlertId" | "activeAlertCount"
> {
  const sorted = [...active].sort((a, b) => {
    const byPriority = priorityRank[a.priority] - priorityRank[b.priority];
    if (byPriority !== 0) return byPriority;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  const driving = sorted[0] ?? null;
  return {
    currentPriority: driving?.priority ?? null,
    currentAlertId: driving?.id ?? null,
    activeAlertCount: sorted.length,
  };
}

/** Lock the room row for the rest of the transaction (create/resolve/ack share this). */
export async function lockEventRoom(
  tx: PrismaTransactionClient,
  roomId: string,
): Promise<void> {
  const rows = await tx.$queryRaw<{ id: string }[]>(
    Prisma.sql`SELECT id FROM "EventRoom" WHERE id = ${roomId} FOR UPDATE`,
  );
  if (rows.length === 0) {
    throw new Error("ROOM_NOT_FOUND");
  }
}

/**
 * Recompute EventRoom projection from active alerts.
 * Driving alert = oldest active at the highest priority (HIGH before MEDIUM).
 */
export async function recomputeRoomProjection(
  tx: PrismaTransactionClient,
  roomId: string,
): Promise<RoomAlertProjection> {
  const active = await tx.alert.findMany({
    where: {
      roomId,
      status: { in: [...ACTIVE_ALERT_STATUSES] },
    },
    select: {
      id: true,
      priority: true,
      createdAt: true,
    },
  });

  const computed = computeProjectionFromActiveAlerts(active);
  const statusUpdatedAt = new Date();

  await tx.eventRoom.update({
    where: { id: roomId },
    data: {
      currentPriority: computed.currentPriority,
      currentAlertId: computed.currentAlertId,
      activeAlertCount: computed.activeAlertCount,
      statusUpdatedAt,
    },
  });

  return {
    ...computed,
    statusUpdatedAt,
  };
}
