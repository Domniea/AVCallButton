import type { Event } from "@prisma/client";

import { EventStatus } from "../prismaClient";

export type EventCallGateFields = Pick<Event, "status" | "endTime">;

/** Whether a guest may place a help call for a room on this event. */
export function isEventAcceptingCalls(event: EventCallGateFields): boolean {
  if (
    event.status === EventStatus.ENDED ||
    event.status === EventStatus.CANCELLED
  ) {
    return false;
  }

  if (event.endTime != null && Date.now() > event.endTime.getTime()) {
    return false;
  }

  return true;
}
