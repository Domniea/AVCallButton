import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { prisma } from "../lib/prisma";
import { authorize } from "../lib/authorization";
import { badRequest, forbidden, serverError } from "../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const workspaceId = event.pathParameters?.workspaceId;
    if (!workspaceId) return badRequest("Missing workspaceId");

    await authorize(userId, workspaceId, "workspace:viewMembers");

    const members = await prisma.membership.findMany({
      where: { workspaceId, status: "active" },
      include: { workspaceRole: true },
      orderBy: { joinedAt: "asc" },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        members: members.map((m) => ({
          id: m.id,
          userId: m.userId,
          email: m.email,
          status: m.status,
          joinedAt: m.joinedAt,
          role: m.role,
          roleRank: m.workspaceRole.rank,
          roleName: m.workspaceRole.name,
          workspaceRoleId: m.workspaceRoleId,
        })),
      }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED")
        return forbidden("Not a member of this workspace");
      if (error.message === "FORBIDDEN")
        return forbidden("Insufficient permissions");
    }
    console.error("Failed to list members:", error);
    return serverError("Failed to list members");
  }
};
