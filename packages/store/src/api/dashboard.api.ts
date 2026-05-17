import { getApiClient } from "./client";

export type DashboardEvent = {
  id: string;
  name: string;
  status: string;
  location: string | null;
  venue: string | null;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  workspaceId: string;
};

export type DashboardWorkspace = {
  workspaceId: string;
  name: string;
  type: string;
  role: string | null;
  eventCount: number;
  recentEvents: DashboardEvent[];
};

export type DashboardResponse = {
  workspaces: DashboardWorkspace[];
};

export async function fetchDashboard(
  token: string
): Promise<DashboardResponse> {
  const api = getApiClient();
  const res = await api.get<DashboardResponse>("/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
