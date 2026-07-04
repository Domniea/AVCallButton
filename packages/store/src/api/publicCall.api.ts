import { getApiClient } from "./client";

export type CallMeta = {
  acceptingCalls: boolean;
  event: { name: string };
  room: { name: string };
  zone: { name: string } | null;
};

export type CreateHelpAlertResult = {
  alertId: string;
  notifiedCount: number;
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
  input?: { message?: string },
): Promise<CreateHelpAlertResult> {
  const api = getApiClient();
  const body =
    input?.message && input.message.trim().length > 0
      ? { message: input.message.trim() }
      : {};
  const res = await api.post<CreateHelpAlertResult>(
    `/public/call/${encodeURIComponent(callToken)}/alerts`,
    body,
  );
  return res.data;
}
