import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { InviteStatus } from "../lib/prismaClient";

import { prisma } from "../lib/prisma";
import { authorize } from "../lib/authorization";
import { roleKeyFromRank } from "../lib/permissions";
import { badRequest, forbidden, serverError } from "../lib/responses";
import { isValidEmailInput, normalizeEmail } from "../lib/email";
import { findWorkspaceMembershipByEmail } from "../lib/events/eventInvite";

/**
 * Single-email lookup for assign UI: is this address already in the workspace?
 * Does not list other members (privacy-friendly).
 */
export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const workspaceId = event.pathParameters?.workspaceId;
    if (!workspaceId) return badRequest("Missing workspaceId");

    const emailParam = event.queryStringParameters?.email;
    if (!isValidEmailInput(emailParam)) {
      return badRequest("Invalid email");
    }
    const email = normalizeEmail(emailParam);

    await authorize(userId, workspaceId, "event:assignStaff");

    const membership = await findWorkspaceMembershipByEmail(email, workspaceId);

    if (membership) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          found: true,
          kind: "member",
          email,
          membershipId: membership.id,
          membershipStatus: membership.status,
          workspaceRoleId: membership.workspaceRoleId,
          workspaceRoleRank: membership.workspaceRole.rank,
          workspaceRole: roleKeyFromRank(membership.workspaceRole.rank),
          workspaceRoleName: membership.workspaceRole.name,
        }),
      };
    }

    const pendingInvite = await prisma.invite.findFirst({
      where: {
        workspaceId,
        email: { equals: email, mode: "insensitive" },
        status: InviteStatus.PENDING,
      },
      include: { workspaceRole: true },
    });

    if (pendingInvite) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          found: true,
          kind: "pending_invite",
          email,
          inviteId: pendingInvite.id,
          workspaceRoleId: pendingInvite.workspaceRoleId,
          workspaceRoleRank: pendingInvite.workspaceRole.rank,
          workspaceRole: roleKeyFromRank(pendingInvite.workspaceRole.rank),
          workspaceRoleName: pendingInvite.workspaceRole.name,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        found: false,
        kind: "none",
        email,
      }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") {
        return forbidden("Not a member of this workspace");
      }
      if (error.message === "FORBIDDEN") {
        return forbidden("Insufficient permissions");
      }
    }
    console.error("Failed to look up member by email:", error);
    return serverError("Failed to look up member by email");
  }
};
