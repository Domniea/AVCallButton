import type { Membership, WorkspaceRole } from "@prisma/client";

import { roleKeyFromRank } from "../permissions";
import { workspaceRoleFields } from "./role";

export type MembershipWithWorkspaceRole = Membership & {
  workspaceRole: WorkspaceRole;
};

export function membershipToApi(m: MembershipWithWorkspaceRole) {
  return {
    id: m.id,
    userId: m.userId,
    email: m.email,
    status: m.status,
    joinedAt: m.joinedAt,
    workspaceRoleId: m.workspaceRoleId,
    ...workspaceRoleFields(m.workspaceRole),
  };
}

export function membershipRoleToApi(m: MembershipWithWorkspaceRole) {
  return {
    id: m.id,
    userId: m.userId,
    workspaceRoleId: m.workspaceRoleId,
    ...workspaceRoleFields(m.workspaceRole),
  };
}

export function membershipAcceptToApi(
  m: Membership,
  workspaceRole: WorkspaceRole,
) {
  return {
    id: m.id,
    workspaceId: m.workspaceId,
    type: m.type,
    role: roleKeyFromRank(workspaceRole.rank),
  };
}
