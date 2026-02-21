import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
} from "aws-lambda";

import { prisma } from "../lib/prisma";
import { authorize } from "../lib/authorization";
import { badRequest, notFound, forbidden, serverError } from "../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer =
  async (event) => {
    try {
      const claims = event.requestContext.authorizer.jwt.claims;
      const userId = claims.sub as string;

      const showId = event.pathParameters?.id;
      if (!showId) {
        return badRequest("Missing show id");
      }

      const show = await prisma.show.findUnique({
        where: { id: showId },
        select: { workspaceId: true },
      });

      if (!show) {
        return notFound("Show not found");
      }

      await authorize(userId, show.workspaceId, "show:delete");

      await prisma.show.delete({
        where: { id: showId },
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
          return forbidden("Insufficient permissions");
        }
      }
      console.error("Failed to delete show:", error);
      return serverError("Failed to delete show");
    }
  };

