import { getApiClient } from "./client";

export type MemberLookupFound = {
  found: true;
  kind: "member" | "pending_invite";
  email: string;
  workspaceRoleId: string;
  workspaceRoleRank: number;
  workspaceRole: string | null;
  workspaceRoleName: string;
  membershipId?: string;
  membershipStatus?: string;
  inviteId?: string;
};

export type MemberLookupNotFound = {
  found: false;
  kind: "none";
  email: string;
};

export type MemberLookupResponse = MemberLookupFound | MemberLookupNotFound;

/** Single-email workspace check for assign UI (no member list). */
export async function lookupMemberByEmail(
  token: string,
  workspaceId: string,
  email: string,
): Promise<MemberLookupResponse> {
  const api = getApiClient();
  const res = await api.get<MemberLookupResponse>(
    `/workspaces/${workspaceId}/members/lookup`,
    {
      params: { email },
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  return res.data;
}
