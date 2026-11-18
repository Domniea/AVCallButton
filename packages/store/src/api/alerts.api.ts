import { getApiClient } from "./client";

export type AlertPriority = "HIGH" | "MEDIUM";
export type AlertStatus =
  | "OPEN"
  | "ACKNOWLEDGED"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED"
  | "COMPLETED"
  | "REOPENED"
  | "REJECTED";

export type AlertSummary = {
  id: string;
  eventId: string;
  roomId: string;
  kind: string;
  message: string | null;
  priority: AlertPriority;
  status: AlertStatus;
  createdAt: string;
  updatedAt: string;
  acknowledgedAt: string | null;
  acknowledgedBy: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
};

export type RoomAlertProjection = {
  id: string;
  currentPriority: AlertPriority | null;
  currentAlertId: string | null;
  activeAlertCount: number;
  statusUpdatedAt: string | null;
};

export type ResolveAlertResult = {
  alreadyResolved: boolean;
  alert: AlertSummary;
  room: RoomAlertProjection;
};

export type AlertBoardDrivingAlert = {
  id: string;
  priority: AlertPriority;
  message: string | null;
  status: AlertStatus;
  createdAt: string;
};

export type AlertBoardRoom = {
  id: string;
  name: string;
  zoneId: string | null;
  zoneName: string | null;
  currentPriority: AlertPriority | null;
  currentAlertId: string | null;
  activeAlertCount: number;
  statusUpdatedAt: string | null;
  drivingAlert: AlertBoardDrivingAlert | null;
};

export type AlertBoardCounts = {
  urgent: number;
  pending: number;
  clear: number;
};

export type AlertBoardResponse = {
  counts: AlertBoardCounts;
  rooms: AlertBoardRoom[];
};

export type RoomAlertsResponse = {
  room: {
    id: string;
    name: string;
    zoneId: string | null;
    zoneName: string | null;
    currentPriority: AlertPriority | null;
    currentAlertId: string | null;
    activeAlertCount: number;
    statusUpdatedAt: string | null;
  };
  alerts: AlertSummary[];
};

export async function resolveEventAlert(
  token: string,
  eventId: string,
  alertId: string,
): Promise<ResolveAlertResult> {
  const api = getApiClient();
  const res = await api.post<ResolveAlertResult>(
    `/events/${encodeURIComponent(eventId)}/alerts/${encodeURIComponent(alertId)}/resolve`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function fetchEventAlertBoard(
  token: string,
  eventId: string,
): Promise<AlertBoardResponse> {
  const api = getApiClient();
  const res = await api.get<AlertBoardResponse>(
    `/me/events/${encodeURIComponent(eventId)}/alert-board`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function fetchRoomActiveAlerts(
  token: string,
  eventId: string,
  roomId: string,
): Promise<RoomAlertsResponse> {
  const api = getApiClient();
  const res = await api.get<RoomAlertsResponse>(
    `/me/events/${encodeURIComponent(eventId)}/rooms/${encodeURIComponent(roomId)}/alerts`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}
