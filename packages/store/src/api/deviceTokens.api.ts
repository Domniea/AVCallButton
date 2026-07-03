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
