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

      const workspaceId = event.pathParameters?.workspaceId;
      if (!workspaceId) {
        return badRequest("Missing workspaceId");
      }

      await authorize(userId, workspaceId, "show:create");

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
        body: JSON.stringify({ show }),
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
      console.error("Failed to create show:", error);
      return serverError("Failed to create show");
    }
  };
