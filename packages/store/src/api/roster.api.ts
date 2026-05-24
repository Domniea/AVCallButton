import { getApiClient } from "./client";

/** Confirmed staff on the event roster (`EventAssignment`). */
export type RosterAssignment = {
  id: string;
  eventId: string;
  membershipId: string;
  workspaceRoleId: string;
  userId: string;
  email: string | null;
  membershipType: string;
  eventRank: number;
  role: string | null;
  roleRank: number;
  roleName: string;
  assignedBy: string;
  createdAt: string;
};

/** Pending roster row (`EventInvite` with status PENDING). */
export type RosterPendingInvite = {
  id: string;
  eventId: string;
  membershipId: string | null;
  inviteId: string | null;
  workspaceRoleId: string;
  status: string;
  eventRank: number;
  email: string | null;
  role: string | null;
  roleRank: number;
  roleName: string;
  assignedBy: string;
  createdAt: string;
};

export type EventRosterResponse = {
  assignments: RosterAssignment[];
  pendingInvites: RosterPendingInvite[];
};

export type AssignStaffData = {
  email: string;
  eventRank: number;
  workspaceRoleRank?: number;
};

export async function fetchEventRoster(
  token: string,
  eventId: string,
): Promise<EventRosterResponse> {
  const api = getApiClient();
  const res = await api.get<EventRosterResponse>(`/events/${eventId}/roster`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function assignStaff(
  token: string,
  eventId: string,
  data: AssignStaffData,
): Promise<void> {
  const api = getApiClient();
  const body: AssignStaffData = {
    email: data.email,
    eventRank: data.eventRank,
  };
  if (data.workspaceRoleRank != null) {
    body.workspaceRoleRank = data.workspaceRoleRank;
  }
  await api.post(`/events/${eventId}/roster/assignments`, body, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
