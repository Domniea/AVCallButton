import { getApiClient } from "./client";

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
  zones: {
    id: string;
    name: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    eventId: string;
  }[];
  rooms: {
    id: string;
    name: string;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
    eventId: string;
    zoneId: string | null;
    zone: {
      id: string;
      name: string;
      sortOrder: number;
      createdAt: string;
      updatedAt: string;
      eventId: string;
    } | null;
  }[];
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
