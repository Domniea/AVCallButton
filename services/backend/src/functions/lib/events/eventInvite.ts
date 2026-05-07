import { prisma } from "../prisma";
import { normalizeEmail } from "../email";
import {
  EventInviteStatus,
  Membership,
  MembershipStatus,
  MembershipType,
} from "@prisma/client";

type InviteBranch =
  | "invite_to_workspace_and_assign"
  | "reactivate_then_assign"
  | "assign_now";

export async function findWorkspaceMembershipByEmail(
  email: string,
  workspaceId: string,
) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) return null;

  const membership = await prisma.membership.findFirst({
    where: {
      workspaceId,
      email: { equals: normalizedEmail, mode: "insensitive" },
    },
    include: { workspaceRole: true },
  });

  return membership;
}

export function isMembershipActive(membership: Membership) {
  if (membership.status === MembershipStatus.ACTIVE) {
    return "ACTIVE";
  }
  return "INACTIVE";
}

export function isMembershipInternal(membership: Membership) {
  if (membership.type === MembershipType.INTERNAL) {
    return "INTERNAL";
  }
  return "EXTERNAL";
}

async function assertNotAlreadyAssigned(
  eventId: string,
  membershipId: string | null,
) {
  if (!membershipId) return;

  const existing = await prisma.eventAssignment.findFirst({
    where: { eventId, membershipId },
  });

  if (existing) {
    throw new Error("Event already assigned");
  }
}

async function assertNoPendingEventInvite(params: {
  eventId: string;
  workspaceId: string;
  email: string;
}) {
  const normalizedEmail = normalizeEmail(params.email);
  if (!normalizedEmail) return;

  const existing = await prisma.eventInvite.findFirst({
    where: {
      eventId: params.eventId,
      status: EventInviteStatus.PENDING,
      invite: {
        email: { equals: normalizedEmail, mode: "insensitive" },
        workspaceId: params.workspaceId,
      },
    },
  });

  if (existing) {
    throw new Error("User already invited");
  }
}

export async function assertNoDuplicateAssignmentOrPendingInvite({
  eventId,
  workspaceId,
  membership,
  email,
}: {
  eventId: string;
  workspaceId: string;
  membership: Membership | null;
  email: string;
}) {
  await assertNotAlreadyAssigned(eventId, membership?.id ?? null);
  await assertNoPendingEventInvite({ eventId, workspaceId, email });
}

export function resolveInviteBranch(
  membership: Membership | null,
): InviteBranch {
  if (!membership) return "invite_to_workspace_and_assign";
  if (membership.status === MembershipStatus.INACTIVE) {
    return "reactivate_then_assign";
  }
  return "assign_now";
}

export async function setEventStaffAssignment(
  assignedBy: string,
  eventId: string,
  membership: Membership | null,
  eventRank: number,
) {
  if (!membership) throw new Error("Membership not found");

  const assigneeWorkspaceRole = await prisma.workspaceRole.findUnique({
    where: { uuid: membership.workspaceRoleId },
  });

  if (!assigneeWorkspaceRole) {
    throw new Error("Workspace role not found for membership");
  }

  if (eventRank > assigneeWorkspaceRole.rank) {
    throw new Error(
      "Event rank cannot be greater than the assignee's workspace role rank",
    );
  }

  if (eventRank < 1) {
    throw new Error("Event rank must be at least 1");
  }

  return prisma.eventAssignment.upsert({
    where: { eventId_membershipId: { eventId, membershipId: membership.id } },
    update: {
      eventRank,
      assignedBy,
    },
    create: {
      eventId,
      membershipId: membership.id,
      workspaceRoleId: membership.workspaceRoleId,
      eventRank,
      assignedBy,
    },
  });
}

/** Inactive workspace member: set ACTIVE, then upsert event assignment (same rules as `setEventStaffAssignment`). */
export async function reactivateMemberAndSetEventStaffAssignment(
  assignedBy: string,
  eventId: string,
  membership: Membership,
  eventRank: number,
) {
  if (membership.status !== MembershipStatus.INACTIVE) {
    throw new Error("Membership is not inactive");
  }

  await prisma.membership.update({
    where: { id: membership.id },
    data: { status: MembershipStatus.ACTIVE },
  });

  return setEventStaffAssignment(assignedBy, eventId, membership, eventRank);
}

export async function queWorkspaceInviteAndPendingEventInviteAssignment() {
  return
}