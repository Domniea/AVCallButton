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
