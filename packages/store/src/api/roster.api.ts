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
