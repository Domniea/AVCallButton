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
    if (!workspaceId) {
      return badRequest("Missing workspaceId");
    }

    await authorize(userId, workspaceId, "workspace:delete");

    await prisma.workspace.delete({
      where: { id: workspaceId },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") {
        return forbidden("Not a member of this workspace");
      }
      if (error.message === "FORBIDDEN") {
        return forbidden("Only owner can delete workspace");
      }
    }
    console.error("Failed to delete workspace:", error);
    return serverError("Failed to delete workspace");
  }
};
