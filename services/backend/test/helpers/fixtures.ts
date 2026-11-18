import { randomUUID } from "node:crypto";

import { prisma } from "../../src/functions/lib/prisma";
import {
  EventStatus,
  MembershipStatus,
} from "../../src/functions/lib/prismaClient";
import { roleRank } from "../../src/functions/lib/permissions";
import { seedDefaultWorkspaceRoles } from "../../src/functions/lib/workspaceRoles";

export const hasDatabase = Boolean(process.env.DATABASE_URL?.trim());

export type TestWorkspaceContext = {
  workspaceId: string;
  ownerUserId: string;
  ownerMembershipId: string;
  ownerRoleId: string;
  rolesByRank: Record<number, string>;
};

/** Workspace + default roles + ACTIVE owner membership (Cognito-style userId string). */
export async function createTestWorkspace(
  opts: { ownerUserId?: string; name?: string } = {},
): Promise<TestWorkspaceContext> {
  const ownerUserId = opts.ownerUserId ?? `test-user-${randomUUID()}`;

  return prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: opts.name ?? `test-ws-${randomUUID().slice(0, 8)}`,
        type: "org",
      },
    });

    const ownerRole = await seedDefaultWorkspaceRoles(tx, workspace.id);
    const roles = await tx.workspaceRole.findMany({
      where: { workspaceId: workspace.id },
      select: { uuid: true, rank: true },
    });
    const rolesByRank: Record<number, string> = {};
    for (const role of roles) {
      rolesByRank[role.rank] = role.uuid;
    }

    const membership = await tx.membership.create({
      data: {
        userId: ownerUserId,
        workspaceId: workspace.id,
        workspaceRoleId: ownerRole.uuid,
        status: MembershipStatus.ACTIVE,
      },
    });

    return {
      workspaceId: workspace.id,
      ownerUserId,
      ownerMembershipId: membership.id,
      ownerRoleId: ownerRole.uuid,
      rolesByRank,
    };
  });
}

export async function createTestMembership(
  ctx: TestWorkspaceContext,
  opts: { userId?: string; rank?: number } = {},
) {
  const userId = opts.userId ?? `test-user-${randomUUID()}`;
  const rank = opts.rank ?? roleRank.crew;
  const workspaceRoleId = ctx.rolesByRank[rank];
  if (!workspaceRoleId) {
    throw new Error(`No workspace role for rank ${rank}`);
  }

  const membership = await prisma.membership.create({
    data: {
      userId,
      workspaceId: ctx.workspaceId,
      workspaceRoleId,
      status: MembershipStatus.ACTIVE,
    },
  });

  return { userId, membership };
}

export async function createTestEvent(
  ctx: TestWorkspaceContext,
  opts: {
    name?: string;
    status?: (typeof EventStatus)[keyof typeof EventStatus];
    assignOwner?: boolean;
  } = {},
) {
  const event = await prisma.event.create({
    data: {
      name: opts.name ?? "Test event",
      status: opts.status ?? EventStatus.ACTIVE,
      workspaceId: ctx.workspaceId,
    },
  });

  if (opts.assignOwner !== false) {
    await prisma.eventAssignment.create({
      data: {
        eventId: event.id,
        membershipId: ctx.ownerMembershipId,
        workspaceRoleId: ctx.ownerRoleId,
        eventRank: roleRank.owner,
        assignedBy: ctx.ownerUserId,
      },
    });
  }

  return event;
}

export async function createTestRoom(
  eventId: string,
  opts: { name?: string; sortOrder?: number; zoneId?: string | null } = {},
) {
  return prisma.eventRoom.create({
    data: {
      eventId,
      name: opts.name ?? "Test room",
      sortOrder: opts.sortOrder ?? 0,
      zoneId: opts.zoneId ?? undefined,
    },
  });
}

export async function createTestZone(
  eventId: string,
  opts: { name?: string; sortOrder?: number } = {},
) {
  return prisma.eventZone.create({
    data: {
      eventId,
      name: opts.name ?? "Test zone",
      sortOrder: opts.sortOrder ?? 0,
    },
  });
}

export async function destroyTestWorkspace(workspaceId: string | null | undefined) {
  if (!workspaceId) return;
  await prisma.workspace
    .delete({ where: { id: workspaceId } })
    .catch(() => undefined);
}
