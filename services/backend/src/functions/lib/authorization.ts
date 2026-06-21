import { MembershipStatus } from "./prismaClient";

import { prisma } from "./prisma";
import { hasPermissionForRank, Action } from "./permissions";

async function getMembership(userId: string, workspaceId: string) {
  return prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
    include: {
      workspaceRole: true,
    },
  });
}

export async function authorize(
  userId: string,
  workspaceId: string,
  action: Action,
) {
  const membership = await getMembership(userId, workspaceId);

  if (!membership || membership.status !== MembershipStatus.ACTIVE) {
    throw new Error("NOT_AUTHORIZED");
  }

  if (!membership.workspaceRole) {
    throw new Error("FORBIDDEN");
  }

  if (membership.workspaceRole.workspaceId !== membership.workspaceId) {
    throw new Error("FORBIDDEN");
  }

  if (!hasPermissionForRank(membership.workspaceRole.rank, action)) {
    throw new Error("FORBIDDEN");
  }

  return membership;
}

export async function hasPermissionForUser(
  userId: string,
  workspaceId: string,
  action: Action,
): Promise<boolean> {
  try {
    await authorize(userId, workspaceId, action);
    return true;
  } catch {
    return false;
  }
}

/** Active workspace membership only; no rank check (used by /me routes). */
export async function assertWorkspaceMembership(
  userId: string,
  workspaceId: string,
) {
  const membership = await getMembership(userId, workspaceId);

  if (!membership || membership.status !== MembershipStatus.ACTIVE) {
    throw new Error("NOT_AUTHORIZED");
  }

  return membership;
}
