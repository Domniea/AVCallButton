import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { prisma } from "../lib/prisma";
import { authorize } from "../lib/authorization";
import {
  isRole,
  roleKeyFromRank,
  roleRank,
  type Role,
} from "../lib/permissions";
import { badRequest, notFound, forbidden, serverError } from "../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const workspaceId = event.pathParameters?.workspaceId;
    const targetUserId = event.pathParameters?.userId;
    if (!workspaceId || !targetUserId)
      return badRequest("Missing workspaceId or userId");

    const callerMembership = await authorize(
      userId,
      workspaceId,
      "workspace:changeRole",
    );

    if (!event.body) return badRequest("Missing request body");
    const { role } = JSON.parse(event.body);

    if (!role || typeof role !== "string" || !isRole(role))
      return badRequest("Invalid role");

    const target = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: { userId: targetUserId, workspaceId },
      },
      include: { workspaceRole: true },
    });
    if (!target) return notFound("Member not found");

    if (target.userId === userId)
      return forbidden("Cannot change your own role");

    const callerRank = callerMembership.workspaceRole.rank;
    const newRank = roleRank[role as Role];

    const newWorkspaceRole = await prisma.workspaceRole.findUnique({
      where: {
        workspaceId_rank: { workspaceId, rank: newRank },
      },
    });
    if (!newWorkspaceRole) {
      return badRequest("Invalid role for this workspace");
    }

    if (newRank > callerRank)
      return forbidden("Cannot promote above your own rank");

    const updated = await prisma.membership.update({
      where: { id: target.id },
      data: {
        workspaceRoleId: newWorkspaceRole.uuid,
      },
      include: { workspaceRole: true },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        member: {
          id: updated.id,
          userId: updated.userId,
          role: roleKeyFromRank(updated.workspaceRole.rank),
          roleRank: updated.workspaceRole.rank,
          roleName: updated.workspaceRole.name,
          workspaceRoleId: updated.workspaceRoleId,
        },
      }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED")
        return forbidden("Not a member of this workspace");
      if (error.message === "FORBIDDEN")
        return forbidden("Insufficient permissions");
    }
    console.error("Failed to update role:", error);
    return serverError("Failed to update role");
  }
};
