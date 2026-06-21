import { getApiClient } from "./client";

export type EventMeta = {
  id: string;
  name: string;
  status: string;
  location: string | null;
  venue: string | null;
  startTime: string | null;
  endTime: string | null;
};

export type AssignmentSummary = {
  eventRank: number;
  role: string | null;
  roleRank: number;
  roleName: string;
};

export type AssignmentDetail = AssignmentSummary & {
  id: string;
  eventId: string;
  membershipId: string;
  assignedBy: string;
  createdAt: string;
};

export type CoverageSummary = {
  zoneCount: number;
  roomCount: number;
};

export type MyWorkspaceEventListItem = {
  event: EventMeta;
  assignment: AssignmentSummary;
  coverageSummary: CoverageSummary;
};

export type MyWorkspaceEventsResponse = {
  events: MyWorkspaceEventListItem[];
};

export type CoverageRoom = {
  id: string;
  name: string;
  eventRank: number;
};

export type CoverageZone = {
  id: string;
  name: string;
  eventRank: number;
  rooms: CoverageRoom[];
  alertSummary: { active: number; pending: number };
};

export type MyEventDetail = {
  assignment: AssignmentDetail;
  event: EventMeta;
  workspace: { id: string; name: string };
  zones: CoverageZone[];
  roomsWithoutZone: CoverageRoom[];
};

export async function fetchMyWorkspaceEvents(
  token: string,
  workspaceId: string,
): Promise<MyWorkspaceEventsResponse> {
  const api = getApiClient();
  const res = await api.get<MyWorkspaceEventsResponse>(
    `/me/workspaces/${workspaceId}/events`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
}

export async function fetchMyEventDetail(
  token: string,
  eventId: string,
): Promise<MyEventDetail> {
  const api = getApiClient();
  const res = await api.get<MyEventDetail>(`/me/event/${eventId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
