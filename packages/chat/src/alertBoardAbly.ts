export function eventAlertBoardChannelName(eventId: string): string {
  return `event:${eventId}`;
}

export const ALERT_BOARD_INVALIDATED_EVENT = "alert-board.invalidated";

export type AlertBoardInvalidationAction = "created" | "resolved";

export type AlertBoardInvalidationPayload = {
  eventId: string;
  roomId: string;
  alertId: string;
  action: AlertBoardInvalidationAction;
  updatedAt: string;
};

export function parseAlertBoardInvalidation(
  data: unknown,
): AlertBoardInvalidationPayload | null {
  if (typeof data === "string") {
    try {
      data = JSON.parse(data) as unknown;
    } catch {
      return null;
    }
  }
  if (typeof data !== "object" || data === null) return null;
  const row = data as Record<string, unknown>;
  const eventId = typeof row.eventId === "string" ? row.eventId : "";
  const roomId = typeof row.roomId === "string" ? row.roomId : "";
  const alertId = typeof row.alertId === "string" ? row.alertId : "";
  const action = row.action === "created" || row.action === "resolved" ? row.action : null;
  const updatedAt = typeof row.updatedAt === "string" ? row.updatedAt : "";
  if (!eventId || !roomId || !alertId || !action || !updatedAt) return null;
  return { eventId, roomId, alertId, action, updatedAt };
}
