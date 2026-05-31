import { getApiClient } from "./client";
import type { EventRoom, EventZoneRef } from "./rooms.api";

export type EventZone = EventZoneRef & {
  /** Included on zone create/detail responses; omitted on event list */
  rooms?: EventRoom[];
};

export type CreateZoneData = {
  name?: string;
  roomIds?: string[];
};

export async function createZone(
  token: string,
  eventId: string,
  data: CreateZoneData,
): Promise<{ zone: EventZone }> {
  const api = getApiClient();
  const res = await api.post<{ zone: EventZone }>(
    `/events/${eventId}/zones`,
    data,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}
