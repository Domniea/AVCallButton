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

async function assertNotAlreadyAssigned(eventId: string, membershipId: string | null) {
  if (!membershipId) return;

  const existing = await prisma.eventAssignment.findFirst({
    where: { eventId, membershipId },
  });

  if (existing) {
    throw new Error("Event already assigned");
  }
}

async function assertNoPendingEventInvite(eventId: string, inviteId: string | null) {
  if (!inviteId) return;

  const existing = await prisma.eventInvite.findFirst({
    where: { eventId, inviteId, status: EventInviteStatus.PENDING },
  });

  if (existing) {
    throw new Error("User already invited");
  }
}

export async function assertNoDuplicateAssignmentOrPendingInvite(eventId: string, membership: Membership | null, inviteId: string | null) {
  await assertNotAlreadyAssigned(eventId, membership?.id ?? null);
  await assertNoPendingEventInvite(eventId, inviteId);
}

export function resolveInviteBranch(membership: Membership | null): InviteBranch {
  if (!membership) return "invite_to_workspace_and_assign";
  if (membership.status === MembershipStatus.INACTIVE) {
    return "reactivate_then_assign";
  }
  return "assign_now";
}
