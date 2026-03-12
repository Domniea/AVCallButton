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

    const inviteId = event.pathParameters?.inviteId;
    if (!inviteId) return badRequest("Missing invite ID");

    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
    });
    if (!invite) return notFound("Invite not found");

    await authorize(userId, invite.workspaceId, "workspace:deleteInvite");

    await prisma.invite.delete({
      where: { id: inviteId },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Invite cancelled" }),
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
    console.error("Failed to cancel invite:", error);
    return serverError("Failed to cancel invite");
  }
};
