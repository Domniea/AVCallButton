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

export type CreateEventInput = {
  name: string;
  location?: string;
  venue?: string;
  startTime?: string | null;
  endTime?: string | null;
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

export async function createEvent(
  token: string,
  workspaceId: string,
  data: CreateEventInput,
): Promise<{ event: EventSummary }> {
  const api = getApiClient();
  const res = await api.post<{ event: Omit<EventSummary, "zones" | "rooms"> }>(
    `/workspaces/${workspaceId}/events`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return {
    event: {
      ...res.data.event,
      zones: [],
      rooms: [],
    },
  };
}
