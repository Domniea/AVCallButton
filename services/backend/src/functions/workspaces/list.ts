import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { MembershipStatus } from "../lib/prismaClient";

import { prisma } from "../lib/prisma";
import { normalizeEmail } from "../lib/email";
import { serverError } from "../lib/responses";
import { membershipToWorkspaceSummary } from "../lib/mappers/workspace";
import { seedDefaultWorkspaceRoles } from "../lib/workspaceRoles";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const normalizedClaimEmail = normalizeEmail(claims.email);
    const email = normalizedClaimEmail === "" ? null : normalizedClaimEmail;

    let personalMembership = await prisma.membership.findFirst({
      where: {
        userId,
        workspace: {
          type: "personal",
        },
      },
      include: {
        workspace: true,
      },
    });

    if (!personalMembership) {
      const created = await prisma.$transaction(async (tx) => {
        const workspace = await tx.workspace.create({
          data: {
            name: `Personal – ${userId}`,
            type: "personal",
          },
        });

        const ownerRole = await seedDefaultWorkspaceRoles(tx, workspace.id);

        const membership = await tx.membership.create({
          data: {
            userId,
            email,
            workspaceId: workspace.id,
            workspaceRoleId: ownerRole.uuid,
            status: MembershipStatus.ACTIVE,
          },
          include: { workspace: true },
        });

        return membership;
      });

      personalMembership = created;
    }

    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        workspace: {
          include: { _count: { select: { events: true } } },
        },
        workspaceRole: true,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        workspaces: memberships.map(membershipToWorkspaceSummary),
      }),
    };
  } catch (error) {
    console.error("Failed to list workspaces:", error);
    return serverError("Failed to list workspaces");
  }
};
