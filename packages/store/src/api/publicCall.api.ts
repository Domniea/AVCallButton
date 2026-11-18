import { getApiClient } from "./client";

export type CallMeta = {
  acceptingCalls: boolean;
  event: { name: string };
  room: { name: string };
  zone: { name: string } | null;
};

export type HelpAlertPriority = "HIGH" | "MEDIUM";

export type CreateHelpAlertResult = {
  alertId: string;
  priority: HelpAlertPriority;
  notifiedCount: number;
  room: {
    currentPriority: HelpAlertPriority | null;
    currentAlertId: string | null;
    activeAlertCount: number;
  };
};

export async function fetchCallMeta(callToken: string): Promise<CallMeta> {
  const api = getApiClient();
  const res = await api.get<CallMeta>(
    `/public/call/${encodeURIComponent(callToken)}/meta`,
  );
  return res.data;
}

export async function createHelpAlert(
  callToken: string,
  input?: { message?: string; priority?: HelpAlertPriority },
): Promise<CreateHelpAlertResult> {
  const api = getApiClient();
  const body: { message?: string; priority?: HelpAlertPriority } = {};
  if (input?.message && input.message.trim().length > 0) {
    body.message = input.message.trim();
  }
  if (input?.priority) {
    body.priority = input.priority;
  }
  const res = await api.post<CreateHelpAlertResult>(
    `/public/call/${encodeURIComponent(callToken)}/alerts`,
    body,
  );
  return res.data;
}
