import type { EventInvite } from "@prisma/client";
import {
  EventInviteStatus,
  InviteStatus,
  Membership,
  MembershipStatus,
  MembershipType,
  Prisma,
} from "@prisma/client";

import { isWorkspaceRoleRank } from "../permissions";
import { prisma } from "../prisma";
import { normalizeEmail, sendInviteEmail } from "../email";

type DbClient = Prisma.TransactionClient | typeof prisma;

type InviteBranch =
  | "invite_to_workspace_and_assign"
  | "reactivate_then_assign"
  | "assign_now";

export async function findPendingWorkspaceInviteByEmail(
  email: string,
  workspaceId: string,
) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) return null;

  return prisma.invite.findFirst({
    where: {
      workspaceId,
      email: { equals: normalizedEmail, mode: "insensitive" },
      status: InviteStatus.PENDING,
    },
    include: { workspaceRole: true },
  });
}

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

/**
 * Event rank uses the same tier scale as `WorkspaceRole.rank` and cannot exceed
 * the assignee's workspace role rank for that workspace.
 */
export function assertEventRankWithinWorkspaceRoleRank(
  eventRank: number,
  workspaceRoleRank: number,
): void {
  if (!isWorkspaceRoleRank(eventRank)) {
    throw new Error("Invalid event rank");
  }
  if (eventRank > workspaceRoleRank) {
    throw new Error(
      "Event rank cannot be greater than the workspace role rank",
    );
  }
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

  assertEventRankWithinWorkspaceRoleRank(eventRank, assigneeWorkspaceRole.rank);

  return prisma.eventAssignment.upsert({
    where: { eventId_membershipId: { eventId, membershipId: membership.id } },
    update: {
      eventRank,
      assignedBy,
      workspaceRoleId: membership.workspaceRoleId,
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
  membership: Membership | null,
  eventRank: number,
) {
  if (!membership) throw new Error("Membership not found");

  if (membership.status !== MembershipStatus.INACTIVE) {
    throw new Error("Membership is not inactive");
  }

  await prisma.membership.update({
    where: { id: membership.id },
    data: { status: MembershipStatus.ACTIVE },
  });

  return setEventStaffAssignment(assignedBy, eventId, membership, eventRank);
}

export async function createEventInvite(
  db: DbClient,
  eventId: string,
  userId: string,
  workspaceRoleId: string,
  eventRank: number,
  inviteId: string,
) {
  return db.eventInvite.create({
    data: {
      eventId,
      workspaceRoleId,
      eventRank,
      assignedBy: userId,
      inviteId,
      status: EventInviteStatus.PENDING,
    },
  });
}

/** Queue a workspace invite and pending event invite assignment. */
export async function queWorkspaceInviteAndPendingEventInviteAssignment(
  userId: string,
  workspaceRoleRank: number,
  eventRank: number,
  workspaceId: string,
  eventId: string,
  email: string,
  inviterEmail: string,
) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const workspaceRole = await prisma.workspaceRole.findUnique({
    where: {
      workspaceId_rank: { workspaceId, rank: workspaceRoleRank },
    },
  });

  if (!workspaceRole) {
    throw new Error("Workspace role not found for this rank");
  }

  assertEventRankWithinWorkspaceRoleRank(eventRank, workspaceRole.rank);

  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error("Invalid email");
  }

  const workspace = await prisma.workspace.findUniqueOrThrow({
    where: { id: workspaceId },
    select: { name: true },
  });

  const { invite, eventInvite, sentEmail } = await prisma.$transaction(
    async (tx) => {
      const inviteRow = await tx.invite.upsert({
        where: { email_workspaceId: { email: normalizedEmail, workspaceId } },
        update: {
          workspaceRoleId: workspaceRole.uuid,
          invitedBy: userId,
          expiresAt,
          status: InviteStatus.PENDING,
          membershipType: MembershipType.EXTERNAL,
        },
        create: {
          email: normalizedEmail,
          workspaceRoleId: workspaceRole.uuid,
          workspaceId,
          invitedBy: userId,
          expiresAt,
          status: InviteStatus.PENDING,
          membershipType: MembershipType.EXTERNAL,
        },
      });

      const existingEventInvite = await tx.eventInvite.findFirst({
        where: {
          eventId,
          inviteId: inviteRow.id,
          status: EventInviteStatus.PENDING,
        },
      });

      if (existingEventInvite) {
        const samePayload =
          existingEventInvite.eventRank === eventRank &&
          existingEventInvite.workspaceRoleId === inviteRow.workspaceRoleId &&
          existingEventInvite.assignedBy === userId;

        if (!samePayload) {
          throw new Error(
            "Pending event invite already exists for this event and invite",
          );
        }

        return {
          invite: inviteRow,
          eventInvite: existingEventInvite,
          sentEmail: false as const,
        };
      }

      const eventInviteRow = await createEventInvite(
        tx,
        eventId,
        userId,
        inviteRow.workspaceRoleId,
        eventRank,
        inviteRow.id,
      );

      return {
        invite: inviteRow,
        eventInvite: eventInviteRow,
        sentEmail: true as const,
      };
    },
  );

  if (sentEmail) {
    await sendInviteEmail({
      to: normalizedEmail,
      workspaceName: workspace.name,
      inviterEmail: inviterEmail,
      token: invite.token,
    });
  }

  return { invite, eventInvite };
}

export type FinalizePendingEventInvitesOnAcceptResult = {
  assignments: Array<{
    id: string;
    eventId: string;
    membershipId: string;
    workspaceRoleId: string;
    eventRank: number;
    assignedBy: string;
  }>;
  finalizedEventInviteIds: string[];
};

/**
 * Materialize pending `EventInvite` rows for this workspace invite into `EventAssignment`s
 * and mark each `EventInvite` accepted (membership leg, `inviteId` cleared). Call inside `tx`.
 *
 * Pass `pendingRows` when you already loaded pending invites (e.g. to choose `Membership.type`)
 * so the list is not queried twice.
 */
export async function finalizePendingEventInvitesOnAccept(
  tx: DbClient,
  inviteId: string,
  membership: { id: string; workspaceRoleId: string },
  pendingRows?: EventInvite[],
): Promise<FinalizePendingEventInvitesOnAcceptResult> {
  const pending =
    pendingRows ??
    (await tx.eventInvite.findMany({
      where: {
        inviteId,
        status: EventInviteStatus.PENDING,
      },
    }));

  if (pending.length === 0) {
    return { assignments: [], finalizedEventInviteIds: [] };
  }

  const workspaceRole = await tx.workspaceRole.findUnique({
    where: { uuid: membership.workspaceRoleId },
  });

  if (!workspaceRole) {
    throw new Error("Workspace role not found for membership");
  }

  const assignments: FinalizePendingEventInvitesOnAcceptResult["assignments"] =
    [];
  const finalizedEventInviteIds: string[] = [];

  for (const ev of pending) {
    assertEventRankWithinWorkspaceRoleRank(ev.eventRank, workspaceRole.rank);

    const row = await tx.eventAssignment.create({
      data: {
        eventId: ev.eventId,
        membershipId: membership.id,
        workspaceRoleId: membership.workspaceRoleId,
        eventRank: ev.eventRank,
        assignedBy: ev.assignedBy,
      },
    });

    assignments.push({
      id: row.id,
      eventId: row.eventId,
      membershipId: row.membershipId,
      workspaceRoleId: row.workspaceRoleId,
      eventRank: row.eventRank,
      assignedBy: row.assignedBy,
    });

    await tx.eventInvite.update({
      where: { id: ev.id },
      data: {
        status: EventInviteStatus.ACCEPTED,
        membershipId: membership.id,
        inviteId: null,
      },
    });

    finalizedEventInviteIds.push(ev.id);
  }

  return { assignments, finalizedEventInviteIds };
}
