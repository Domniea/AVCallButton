import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
} from "aws-lambda";

import { prisma } from "../lib/prisma";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer =
  async (event) => {
    try {
      const claims = event.requestContext.authorizer.jwt.claims;
      const userId = claims.sub as string;

      const workspaceId = event.pathParameters?.id;
      if (!workspaceId) {
        return badRequest("Missing workspaceId");
      }

      if (!event.body) {
        return badRequest("Missing request body");
      }

      const { name, location, startTime, endTime } =
        JSON.parse(event.body);

      if (
        !name ||
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 100
      ) {
        return badRequest("Invalid show name");
      }

      // 1️⃣ Ensure user is member of workspace
      const membership = await prisma.membership.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
      });

      if (!membership) {
        return forbidden("Not a member of this workspace");
      }

      // TODO: later replace with permission system
      if (membership.role !== "owner") {
        return forbidden("Insufficient permissions");
      }

      // 2️⃣ Create show
      const show = await prisma.show.create({
        data: {
          name: name.trim(),
          status: "draft",
          location: location ?? null,
          startTime: startTime ? new Date(startTime) : null,
          endTime: endTime ? new Date(endTime) : null,
          workspaceId,
        },
      });

      return {
        statusCode: 201,
        body: JSON.stringify({
          show,
        }),
      };
    } catch (error) {
      console.error("Failed to create show:", error);
      return serverError("Failed to create show");
    }
  };

function badRequest(message: string) {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: message }),
  };
}

function forbidden(message: string) {
  return {
    statusCode: 403,
    body: JSON.stringify({ error: message }),
  };
}

function serverError(message: string) {
  return {
    statusCode: 500,
    body: JSON.stringify({ error: message }),
  };
}