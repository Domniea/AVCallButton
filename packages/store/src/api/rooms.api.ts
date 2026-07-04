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
  callToken: string;
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
