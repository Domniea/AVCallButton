import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { MembershipStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { badRequest, notFound, serverError } from "../lib/responses";
import { roleKeyFromRank } from "../lib/permissions";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const email = claims.email as string;
    const normalizedEmail = email.trim().toLowerCase();

    if (!event.body) return badRequest("Missing request body");

    const { token } = JSON.parse(event.body);
    if (!token) return badRequest("Missing token");

    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { workspaceRole: true },
    });

    if (!invite) return notFound("Invite not found");

    if (invite.email.toLowerCase() !== normalizedEmail) {
      return badRequest(
        `This invite was sent to ${invite.email}. Please log in with that account.`,
      );
    }

    if (invite.status !== "pending") {
      return badRequest("Invite has already been " + invite.status);
    }

    if (invite.expiresAt < new Date()) {
      return badRequest("Invite has expired");
    }

    const { workspaceRole } = invite;
    if (!workspaceRole) {
      return badRequest(
        "Invite is missing workspace role; ask for a new invite",
      );
    }

    if (workspaceRole.workspaceId !== invite.workspaceId) {
      return badRequest("Invite data is inconsistent; ask for a new invite");
    }

    const membership = await prisma.$transaction(async (tx) => {
      const newMembership = await tx.membership.create({
        data: {
          userId,
          email: normalizedEmail,
          workspaceId: invite.workspaceId,
          workspaceRoleId: invite.workspaceRoleId,
          status: MembershipStatus.ACTIVE,
        },
      });

      await tx.invite.update({
        where: { id: invite.id },
        data: { status: "accepted" },
      });

      return newMembership;
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        membership: {
          id: membership.id,
          workspaceId: membership.workspaceId,
          role: roleKeyFromRank(workspaceRole.rank),
        },
      }),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return badRequest("You are already a member of this workspace");
    }
    console.error("Failed to accept invite:", error);
    return serverError("Failed to accept invite");
  }
};
