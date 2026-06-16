import { getApiClient } from "./client";

export type CoverageMembership = {
  id: string;
  userId: string;
  email: string | null;
  workspaceRole: {
    uuid: string;
    name: string;
    rank: number;
  };
};

export type RoomCoverage = {
  id: string;
  roomId: string;
  membershipId: string;
  eventRank: number;
  assignedBy: string;
  createdAt: string;
  membership: CoverageMembership;
};

export type ZoneCoverage = {
  id: string;
  zoneId: string;
  membershipId: string;
  eventRank: number;
  assignedBy: string;
  createdAt: string;
  membership: CoverageMembership;
};

export type AssignCoverageData = {
  membershipId: string;
};

export async function fetchRoomCoverage(
  token: string,
  eventId: string,
  roomId: string,
): Promise<{ coverage: RoomCoverage[] }> {
  const api = getApiClient();
  const res = await api.get<{ coverage: RoomCoverage[] }>(
    `/events/${eventId}/rooms/${roomId}/coverage`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function assignRoomCoverage(
  token: string,
  eventId: string,
  roomId: string,
  data: AssignCoverageData,
): Promise<{ coverage: RoomCoverage }> {
  const api = getApiClient();
  const res = await api.post<{ coverage: RoomCoverage }>(
    `/events/${eventId}/rooms/${roomId}/coverage`,
    data,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function fetchZoneCoverage(
  token: string,
  eventId: string,
  zoneId: string,
): Promise<{ coverage: ZoneCoverage[] }> {
  const api = getApiClient();
  const res = await api.get<{ coverage: ZoneCoverage[] }>(
    `/events/${eventId}/zones/${zoneId}/coverage`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function assignZoneCoverage(
  token: string,
  eventId: string,
  zoneId: string,
  data: AssignCoverageData,
): Promise<{ coverage: ZoneCoverage }> {
  const api = getApiClient();
  const res = await api.post<{ coverage: ZoneCoverage }>(
    `/events/${eventId}/zones/${zoneId}/coverage`,
    data,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function removeRoomCoverage(
  token: string,
  eventId: string,
  roomId: string,
  membershipId: string,
): Promise<{ deleted: boolean; roomId: string; membershipId: string }> {
  const api = getApiClient();
  const res = await api.delete<{
    deleted: boolean;
    roomId: string;
    membershipId: string;
  }>(`/events/${eventId}/rooms/${roomId}/coverage/${membershipId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function removeZoneCoverage(
  token: string,
  eventId: string,
  zoneId: string,
  membershipId: string,
): Promise<{ deleted: boolean; zoneId: string; membershipId: string }> {
  const api = getApiClient();
  const res = await api.delete<{
    deleted: boolean;
    zoneId: string;
    membershipId: string;
  }>(`/events/${eventId}/zones/${zoneId}/coverage/${membershipId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
