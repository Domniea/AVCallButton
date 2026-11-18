import type { Alert as AlertRow } from "@prisma/client";

export function formatAlert(alert: AlertRow) {
  return {
    id: alert.id,
    eventId: alert.eventId,
    roomId: alert.roomId,
    kind: alert.kind,
    message: alert.message,
    priority: alert.priority,
    status: alert.status,
    createdAt: alert.createdAt.toISOString(),
    updatedAt: alert.updatedAt.toISOString(),
    acknowledgedAt: alert.acknowledgedAt?.toISOString() ?? null,
    acknowledgedBy: alert.acknowledgedBy,
    resolvedAt: alert.resolvedAt?.toISOString() ?? null,
    resolvedBy: alert.resolvedBy,
  };
}
