import { getApiClient } from "./client";

/** Shape of each workspace row from `GET /workspaces`. */
export type WorkspaceSummary = {
  workspaceId: string;
  name: string;
  type: string;
  role: string | null;
  roleRank: number;
  roleName: string;
  createdAt: string;
  eventCount: number;
};

export type WorkspacesListResponse = {
  workspaces: WorkspaceSummary[];
};

export async function fetchWorkspaces(
  token: string
): Promise<WorkspacesListResponse> {
  const api = getApiClient();
  const res = await api.get<WorkspacesListResponse>("/workspaces", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}
