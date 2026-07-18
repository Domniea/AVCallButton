import { getApiClient } from "./client";

export type DevicePlatform = "IOS" | "ANDROID" | "WEB";

export type DeviceTokenRecord = {
  id: string;
  platform: DevicePlatform;
  createdAt: string;
  updatedAt: string;
};

export type UpsertDeviceTokenInput = {
  platform: DevicePlatform;
  token: string;
};

export async function upsertDeviceToken(
  authToken: string,
  input: UpsertDeviceTokenInput,
): Promise<DeviceTokenRecord> {
  const api = getApiClient();
  const res = await api.post<{ deviceToken: DeviceTokenRecord }>(
    "/me/device-tokens",
    input,
    {
      headers: { Authorization: `Bearer ${authToken}` },
    },
  );
  return res.data.deviceToken;
}

export type TestPushResult = {
  sent: number;
  staleRemoved: number;
  webSent?: number;
  nativeSent?: number;
};

/** Ask the API to send a diagnostic push to this user's registered devices. */
export async function sendTestPush(
  authToken: string,
): Promise<TestPushResult> {
  const api = getApiClient();
  const res = await api.post<TestPushResult>(
    "/me/push/test",
    {},
    {
      headers: { Authorization: `Bearer ${authToken}` },
    },
  );
  return res.data;
}

/** @deprecated Prefer sendTestPush — same endpoint, all platforms. */
export const sendTestWebPush = sendTestPush;
export type TestWebPushResult = TestPushResult;
