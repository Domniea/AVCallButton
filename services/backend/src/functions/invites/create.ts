import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { InviteStatus, MembershipType } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { authorize } from "../lib/authorization";
import { inviteToApi } from "../lib/mappers/invite";
import { isRole, roleRank } from "../lib/permissions";
import { badRequest, forbidden, serverError } from "../lib/responses";
import {
  isValidEmailInput,
  normalizeEmail,
  sendInviteEmail,
} from "../lib/email";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const workspaceId = event.pathParameters?.workspaceId;
    if (!workspaceId) {
      return badRequest("Missing workspaceId");
    }

    const membership = await authorize(userId, workspaceId, "workspace:invite");

    if (!event.body) {
      return badRequest("Missing request body");
    }

    const { email, role } = JSON.parse(event.body) as {
      email?: string;
      role?: number;
    };

    if (!isValidEmailInput(email)) {
      return badRequest("Invalid email");
    }
    const normalizedEmail = normalizeEmail(email);

    if (!role || typeof role !== "string" || !isRole(role)) {
      return badRequest("Invalid role");
    }

    const callerRank = membership.workspaceRole.rank;
    const invitedRank = roleRank[role];

    if (invitedRank > callerRank) {
      return forbidden("Cannot invite someone to a role above your own");
    }

    const workspaceRole = await prisma.workspaceRole.findUnique({
      where: {
        workspaceId_rank: { workspaceId, rank: invitedRank },
      },
    });
    if (!workspaceRole) {
      return badRequest("Invalid role for this workspace");
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invite = await prisma.invite.upsert({
      where: {
        email_workspaceId: { email: normalizedEmail, workspaceId },
      },
      update: {
        workspaceRoleId: workspaceRole.uuid,
        invitedBy: userId,
        expiresAt,
        status: InviteStatus.PENDING,
        membershipType: MembershipType.INTERNAL,
      },
      create: {
        email: normalizedEmail,
        workspaceRoleId: workspaceRole.uuid,
        workspaceId,
        invitedBy: userId,
        expiresAt,
        membershipType: MembershipType.INTERNAL,
      },
    });

    const workspace = await prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      select: { name: true },
    });

    const inviterEmail = normalizeEmail(claims.email) || "Someone";

    await sendInviteEmail({
      to: normalizedEmail,
      workspaceName: workspace.name,
      inviterEmail,
      token: invite.token,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        invite: inviteToApi(invite, workspaceRole),
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
    console.error("Failed to create invite:", error);
    return serverError("Failed to create invite");
  }
};
