import { Rest } from "ably";

export function eventAlertBoardChannelName(eventId: string): string {
  return `event:${eventId}`;
}

/** Clients treat this as an invalidation signal and refetch the board. */
export const ALERT_BOARD_INVALIDATED_EVENT = "alert-board.invalidated";

export type AlertBoardInvalidationAction = "created" | "resolved";

export type AlertBoardInvalidationPayload = {
  eventId: string;
  roomId: string;
  alertId: string;
  action: AlertBoardInvalidationAction;
  updatedAt: string;
};

function getAblyRest(): Rest {
  const key = process.env.ABLY_API_KEY?.trim();
  if (!key) {
    throw new Error("ABLY_NOT_CONFIGURED");
  }
  return new Rest({ key });
}

/**
 * Publish alert-board invalidation on `event:{eventId}`.
 * Never throws — Postgres remains source of truth.
 */
export async function publishAlertBoardInvalidated(
  params: AlertBoardInvalidationPayload,
): Promise<void> {
  try {
    const rest = getAblyRest();
    await rest.channels
      .get(eventAlertBoardChannelName(params.eventId))
      .publish(ALERT_BOARD_INVALIDATED_EVENT, params);
  } catch (error) {
    console.error("Failed to publish alert-board invalidation to Ably:", error);
  }
}
