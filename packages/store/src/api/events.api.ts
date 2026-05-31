import { getApiClient } from "./client";
import type { EventRoom } from "./rooms.api";
import type { EventZone } from "./zones.api";

export type EventSummary = {
  id: string;
  name: string;
  status: string;
  location: string | null;
  venue: string | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  workspaceId: string;
  zones: EventZone[];
  rooms: EventRoom[];
};

export type EventsListResponse = {
  events: EventSummary[];
};

export async function fetchEvents(
  token: string,
  workspaceId: string,
): Promise<EventsListResponse> {
  const api = getApiClient();
  const res = await api.get<EventsListResponse>(
    `/workspaces/${workspaceId}/events`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return res.data;
}
