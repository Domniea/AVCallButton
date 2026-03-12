import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { prisma } from "../lib/prisma";
import { authorize } from "../lib/authorization";
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

    await authorize(userId, workspaceId, "workspace:removeMember");

    const target = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: { userId: targetUserId, workspaceId },
      },
    });

    if (!target) return notFound("Member not found");

    if (target.userId === userId) return forbidden("Cannot remove yourself");

    await prisma.membership.delete({ where: { id: target.id } });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Member removed" }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED")
        return forbidden("Not a member of this workspace");
      if (error.message === "FORBIDDEN")
        return forbidden("Insufficient permissions");
    }
    console.error("Failed to remove member:", error);
    return serverError("Failed to remove member");
  }
};
