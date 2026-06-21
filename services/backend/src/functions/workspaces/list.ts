import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import type { Prisma as PrismaTypes } from "@prisma/client";
import { MembershipStatus, Prisma } from "../lib/prismaClient";

import { prisma } from "../lib/prisma";
import { normalizeEmail } from "../lib/email";
import { serverError } from "../lib/responses";
import { membershipToWorkspaceSummary } from "../lib/mappers/workspace";
import { seedDefaultWorkspaceRoles } from "../lib/workspaceRoles";

const membershipInclude = {
  workspace: {
    include: { _count: { select: { events: true } } },
  },
  workspaceRole: true,
} as const;

type MembershipRow = PrismaTypes.MembershipGetPayload<{
  include: typeof membershipInclude;
}>;

function pickPersonalMembership(
  memberships: MembershipRow[],
): MembershipRow | undefined {
  const personal = memberships.filter((m) => m.workspace.type === "personal");
  if (personal.length === 0) return undefined;
  return personal.sort(
    (a, b) => a.joinedAt.getTime() - b.joinedAt.getTime(),
  )[0];
}

function membershipsForResponse(
  memberships: MembershipRow[],
): MembershipRow[] {
  const personal = pickPersonalMembership(memberships);
  const nonPersonal = memberships.filter((m) => m.workspace.type !== "personal");
  return personal ? [personal, ...nonPersonal] : nonPersonal;
}

async function ensurePersonalWorkspace(
  userId: string,
  email: string | null,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw(
      Prisma.sql`SELECT pg_advisory_xact_lock(hashtext(${userId}::text))`,
    );

    const existing = await tx.membership.findFirst({
      where: {
        userId,
        workspace: {
          type: "personal",
        },
      },
    });
    if (existing) return;

    const workspace = await tx.workspace.create({
      data: {
        name: `Personal – ${userId}`,
        type: "personal",
      },
    });

    const ownerRole = await seedDefaultWorkspaceRoles(tx, workspace.id);

    await tx.membership.create({
      data: {
        userId,
        email,
        workspaceId: workspace.id,
        workspaceRoleId: ownerRole.uuid,
        status: MembershipStatus.ACTIVE,
      },
    });
  });
}

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const normalizedClaimEmail = normalizeEmail(claims.email);
    const email = normalizedClaimEmail === "" ? null : normalizedClaimEmail;

    await ensurePersonalWorkspace(userId, email);

    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: membershipInclude,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        workspaces: membershipsForResponse(memberships).map(
          membershipToWorkspaceSummary,
        ),
      }),
    };
  } catch (error) {
    console.error("Failed to list workspaces:", error);
    return serverError("Failed to list workspaces");
  }
};
