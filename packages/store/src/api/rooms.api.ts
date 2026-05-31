import { getApiClient } from "./client";

/** Zone fields when nested on a room (no nested rooms list). */
export type EventZoneRef = {
  id: string;
  name: string;
  sortOrder: number;
  eventId: string;
  createdAt: string;
  updatedAt: string;
};

export type EventRoom = {
  id: string;
  name: string;
  sortOrder: number;
  eventId: string;
  zoneId: string | null;
  createdAt: string;
  updatedAt: string;
  /** Present on room endpoints and event lists; omitted when nested under zone.rooms */
  zone?: EventZoneRef | null;
};

export type CreateRoomData = {
  name: string;
  zoneId?: string;
};

export type UpdateRoomData = {
  name?: string;
  zoneId?: string | null;
  sortOrder?: number;
};

/** Staff assigned to a room (`EventRoomAssignment`). */
export type RoomAssignment = {
  id: string;
  roomId: string;
  membershipId: string;
  assignedBy: string;
  createdAt: string;
  membership: {
    id: string;
    userId: string;
    workspaceId: string;
    workspaceRole: {
      id: string;
      name: string;
      rank: number;
    };
  };
};

export type RoomAssignmentsResponse = {
  assignments: RoomAssignment[];
};

export type AssignRoomStaffData = {
  membershipId: string;
};

export async function createRoom(
  token: string,
  eventId: string,
  data: CreateRoomData,
): Promise<{ room: EventRoom }> {
  const api = getApiClient();
  const res = await api.post<{ room: EventRoom }>(
    `/events/${eventId}/rooms`,
    data,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function fetchEventRooms(
  token: string,
  eventId: string,
): Promise<{ rooms: EventRoom[] }> {
  const api = getApiClient();
  const res = await api.get<{ rooms: EventRoom[] }>(
    `/events/${eventId}/rooms`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function updateRoom(
  token: string,
  eventId: string,
  roomId: string,
  data: UpdateRoomData,
): Promise<{ room: EventRoom }> {
  const api = getApiClient();
  const res = await api.patch<{ room: EventRoom }>(
    `/events/${eventId}/rooms/${roomId}`,
    data,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function fetchRoomAssignments(
  token: string,
  eventId: string,
  roomId: string,
): Promise<RoomAssignmentsResponse> {
  const api = getApiClient();
  const res = await api.get<RoomAssignmentsResponse>(
    `/events/${eventId}/rooms/${roomId}/assignments`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function assignRoomStaff(
  token: string,
  eventId: string,
  roomId: string,
  data: AssignRoomStaffData,
): Promise<{ assignment: RoomAssignment }> {
  const api = getApiClient();
  const res = await api.post<{ assignment: RoomAssignment }>(
    `/events/${eventId}/rooms/${roomId}/assignments`,
    data,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function removeRoomAssignment(
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
  }>(`/events/${eventId}/rooms/${roomId}/assignments/${membershipId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
