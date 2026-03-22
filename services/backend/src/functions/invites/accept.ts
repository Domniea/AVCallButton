import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { prisma } from "../lib/prisma";
import { badRequest, notFound, serverError } from "../lib/responses";
import { roleRank, type Role } from "../lib/permissions";

/** Old invite `role` strings before guest/crew/lead/manager/owner. */
const LEGACY_INVITE_ROLE_RANK: Record<string, number> = {
  tech: 2,
  leadTech: 4,
  showLead: 6,
  owner: 10,
};

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const email = claims.email as string;

    if (!event.body) return badRequest("Missing request body");

    const { token } = JSON.parse(event.body);
    if (!token) return badRequest("Missing token");

    const invite = await prisma.invite.findUnique({
      where: { token },
    });

    if (!invite) return notFound("Invite not found");

    if (invite.email !== email) {
      return badRequest(
        `This invite was sent to ${invite.email}. Please log in with that account.`
      );
    }

    if (invite.status !== "pending") {
      return badRequest("Invite has already been " + invite.status);
    }

    if (invite.expiresAt < new Date()) {
      return badRequest("Invite has expired");
    }

    const rank =
      roleRank[invite.role as Role] ?? LEGACY_INVITE_ROLE_RANK[invite.role];
    if (rank === undefined) {
      return badRequest("Invite has an invalid role; ask for a new invite");
    }

    const workspaceRole = await prisma.workspaceRole.findUnique({
      where: {
        workspaceId_rank: {
          workspaceId: invite.workspaceId,
          rank,
        },
      },
    });
    if (!workspaceRole) {
      return badRequest("Workspace role missing; contact workspace admin");
    }

    const membership = await prisma.$transaction(async (tx) => {
      const newMembership = await tx.membership.create({
        data: {
          userId,
          email,
          workspaceId: invite.workspaceId,
          role: invite.role,
          workspaceRoleId: workspaceRole.uuid,
          status: "active",
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
          role: membership.role,
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
