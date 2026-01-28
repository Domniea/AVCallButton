import { getApiClient } from "../api/client";

export type MeResponse = {
  id: string;
  email: string;
};

export async function fetchMe(token: string): Promise<MeResponse> {
  const api = getApiClient();

  const res = await api.get<MeResponse>("/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}
