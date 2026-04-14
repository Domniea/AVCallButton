import type { Invite, WorkspaceRole } from "@prisma/client";

import { roleKeyFromRank } from "./permissions";

/** Single shape for invite payloads (list + create) — mirrors WorkspaceRole for display. */
export function inviteToApi(invite: Invite, workspaceRole: WorkspaceRole) {
  return {
    id: invite.id,
    email: invite.email,
    status: invite.status,
    token: invite.token,
    expiresAt: invite.expiresAt,
    workspaceId: invite.workspaceId,
    workspaceRoleId: invite.workspaceRoleId,
    invitedBy: invite.invitedBy,
    createdAt: invite.createdAt,
    role: roleKeyFromRank(workspaceRole.rank),
    roleRank: workspaceRole.rank,
    roleName: workspaceRole.name,
  };
}
