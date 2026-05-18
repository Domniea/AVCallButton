import type {
  EventAssignment,
  EventInvite,
  Invite,
  Membership,
  WorkspaceRole,
} from "@prisma/client";

import { workspaceRoleFields } from "./role";

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
    ...workspaceRoleFields(row.workspaceRole),
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
    ...workspaceRoleFields(row.workspaceRole),
    assignedBy: row.assignedBy,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Pending event invite leg of assign (queued external). */
export function eventInviteToAssignResponse(eventInvite: EventInvite) {
  return {
    id: eventInvite.id,
    eventId: eventInvite.eventId,
    inviteId: eventInvite.inviteId,
    workspaceRoleId: eventInvite.workspaceRoleId,
    eventRank: eventInvite.eventRank,
    status: eventInvite.status,
    assignedBy: eventInvite.assignedBy,
  };
}

/** Confirmed assignment leg of assign (member / reactivate). */
export function eventAssignmentToAssignResponse(row: EventAssignment) {
  return {
    id: row.id,
    eventId: row.eventId,
    membershipId: row.membershipId,
    workspaceRoleId: row.workspaceRoleId,
    eventRank: row.eventRank,
    assignedBy: row.assignedBy,
    createdAt: row.createdAt.toISOString(),
  };
}
