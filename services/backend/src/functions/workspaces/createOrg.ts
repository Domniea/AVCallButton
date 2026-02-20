import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
} from "aws-lambda";

import { prisma } from "../lib/prisma";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer =
  async (event) => {
    try {
      const claims = event.requestContext.authorizer.jwt.claims;
      const userId = claims.sub as string;

      if (!event.body) {
        return badRequest("Missing request body");
      }

      const { name } = JSON.parse(event.body);

      if (
        !name ||
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 100
      ) {
        return badRequest("Invalid workspace name");
      }

      const trimmedName = name.trim();

      const workspace = await prisma.$transaction(async (tx) => {
        const newWorkspace = await tx.workspace.create({
          data: {
            name: trimmedName,
            type: "org",
          },
        });

        await tx.membership.create({
          data: {
            userId,
            workspaceId: newWorkspace.id,
            role: "owner",
            status: "active",
          },
        });

        return newWorkspace;
      });

      return {
        statusCode: 201,
        body: JSON.stringify({
          workspace: {
            workspaceId: workspace.id,
            name: workspace.name,
            type: workspace.type,
            role: "owner",
            createdAt: workspace.createdAt,
          },
        }),
      };
    } catch (error) {
      console.error("Failed to create org workspace:", error);
      return serverError("Failed to create org workspace");
    }
  };

function badRequest(message: string) {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: message }),
  };
}

function serverError(message: string) {
  return {
    statusCode: 500,
    body: JSON.stringify({ error: message }),
  };
}