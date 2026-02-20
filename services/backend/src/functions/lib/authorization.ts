import { prisma } from "./prisma";
import { hasPermission, Role, Action } from "./permissions";

async function getMembership(userId: string, workspaceId: string) {
  return prisma.membership.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
    },
  });
}

export async function authorize(
  userId: string,
  workspaceId: string,
  action: Action
) {
  const membership = await getMembership(userId, workspaceId);

  if (!membership || membership.status !== "active") {
    throw new Error("NOT_AUTHORIZED");
  }

  const role = membership.role as Role;

  if (!hasPermission(role, action)) {
    throw new Error("FORBIDDEN");
  }

  return membership;
}

export async function hasPermissionForUser(
  userId: string,
  workspaceId: string,
  action: Action
): Promise<boolean> {
  try {
    await authorize(userId, workspaceId, action);
    return true;
  } catch {
    return false;
  }
}