import type {
  EventAssignment,
  EventInvite,
  Invite,
  Membership,
  WorkspaceRole,
} from "@prisma/client";

import { roleKeyFromRank } from "../permissions";

export type EventAssignmentWithRelations = EventAssignment & {
  membership: Membership;
  workspaceRole: WorkspaceRole;
};

export type EventInviteWithRelations = EventInvite & {
  membership: Membership | null;
  invite: Invite | null;
  workspaceRole: WorkspaceRole;
};

export function eventAssignmentToApi(row: EventAssignmentWithRelations) {
  return {
    id: row.id,
    eventId: row.eventId,
    membershipId: row.membershipId,
    workspaceRoleId: row.workspaceRoleId,
    userId: row.membership.userId,
    email: row.membership.email,
    membershipType: row.membership.type,
    eventRank: row.eventRank,
    role: roleKeyFromRank(row.workspaceRole.rank),
    roleRank: row.workspaceRole.rank,
    roleName: row.workspaceRole.name,
    assignedBy: row.assignedBy,
    createdAt: row.createdAt.toISOString(),
  };
}

export function eventInviteToApi(row: EventInviteWithRelations) {
  const email = row.membership?.email ?? row.invite?.email ?? null;

  return {
    id: row.id,
    eventId: row.eventId,
    membershipId: row.membershipId,
    inviteId: row.inviteId,
    workspaceRoleId: row.workspaceRoleId,
    status: row.status,
    eventRank: row.eventRank,
    email,
    role: roleKeyFromRank(row.workspaceRole.rank),
    roleRank: row.workspaceRole.rank,
    roleName: row.workspaceRole.name,
    assignedBy: row.assignedBy,
    createdAt: row.createdAt.toISOString(),
  };
}
