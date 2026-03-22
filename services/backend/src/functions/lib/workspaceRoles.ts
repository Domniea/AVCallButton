import type { PrismaClient } from "@prisma/client";

/** Client passed to `prisma.$transaction(async (tx) => ...)` */
export type PrismaTransactionClient = Omit<
  PrismaClient,
  | "$connect"
  | "$disconnect"
  | "$on"
  | "$transaction"
  | "$extends"
>;

/** Default display names per rank; must stay aligned with `roleRank` in permissions.ts */
export const DEFAULT_WORKSPACE_ROLES = [
  { rank: 2, name: "GUEST" },
  { rank: 4, name: "CREW" },
  { rank: 6, name: "LEAD" },
  { rank: 8, name: "MANAGER" },
  { rank: 10, name: "OWNER" },
] as const;

/** Rank for the top workspace tier (matches `roleRank.owner`) */
export const OWNER_RANK = 10;

/**
 * Inserts the five default workspace roles and returns the owner row for membership wiring.
 */
export async function seedDefaultWorkspaceRoles(
  tx: PrismaTransactionClient,
  workspaceId: string,
) {
  await tx.workspaceRole.createMany({
    data: DEFAULT_WORKSPACE_ROLES.map((r) => ({
      workspaceId,
      rank: r.rank,
      name: r.name,
      description: "",
    })),
  });

  const ownerRole = await tx.workspaceRole.findUnique({
    where: {
      workspaceId_rank: {
        workspaceId,
        rank: OWNER_RANK,
      },
    },
  });

  if (!ownerRole) {
    throw new Error("Failed to seed owner workspace role");
  }

  return ownerRole;
}
