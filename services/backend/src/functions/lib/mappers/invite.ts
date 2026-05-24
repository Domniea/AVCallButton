import type { Invite, WorkspaceRole } from "@prisma/client";

import { workspaceRoleFields } from "./role";

/** Workspace invite row for list + create responses. */
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
    membershipType: invite.membershipType,
    ...workspaceRoleFields(workspaceRole),
  };
}

/** Workspace invite leg of assign (queued external). */
export function inviteToAssignResponse(invite: Invite) {
  return {
    id: invite.id,
    email: invite.email,
    workspaceId: invite.workspaceId,
    workspaceRoleId: invite.workspaceRoleId,
    status: invite.status,
    expiresAt: invite.expiresAt.toISOString(),
    createdAt: invite.createdAt.toISOString(),
  };
}
