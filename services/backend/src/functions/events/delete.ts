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

      const eventId = event.pathParameters?.eventId;
      if (!eventId) {
        return badRequest("Missing event id");
      }

      const existing = await prisma.event.findUnique({
        where: { id: eventId },
        select: { workspaceId: true },
      });

      if (!existing) {
        return notFound("Event not found");
      }

      await authorize(userId, existing.workspaceId, "event:delete");

      await prisma.event.delete({
        where: { id: eventId },
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
      console.error("Failed to delete event:", error);
      return serverError("Failed to delete event");
    }
  };
