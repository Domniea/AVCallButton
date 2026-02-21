import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
} from "aws-lambda";

import { prisma } from "../lib/prisma";
import { badRequest, forbidden, serverError } from "../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer =
  async (event) => {
    try {
      const claims = event.requestContext.authorizer.jwt.claims;
      const userId = claims.sub as string;

      const workspaceId = event.pathParameters?.id;
      if (!workspaceId) {
        return badRequest("Missing workspaceId");
      }

      const membership = await prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
      });

      if (!membership || membership.role !== "owner") {
        return forbidden("Only owner can delete workspace");
      }

      await prisma.workspace.delete({
        where: { id: workspaceId },
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true }),
      };
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      return serverError("Failed to delete workspace");
    }
  };
