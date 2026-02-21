import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
} from "aws-lambda";

import { prisma } from "../lib/prisma";
import { authorize } from "../lib/authorization";
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

      await authorize(userId, workspaceId, "show:view");

      const shows = await prisma.show.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ shows }),
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
      console.error("Failed to list shows:", error);
      return serverError("Failed to list shows");
    }
  };
