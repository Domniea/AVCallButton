import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
} from "aws-lambda";

import { prisma } from "../lib/prisma";
import { badRequest, serverError } from "../lib/responses";
import { seedDefaultWorkspaceRoles } from "../lib/workspaceRoles";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer =
  async (event) => {
    try {
      const claims = event.requestContext.authorizer.jwt.claims;
      const userId = claims.sub as string;
      const email = typeof claims.email === "string" ? claims.email : null;

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

      const { workspace, ownerRole } = await prisma.$transaction(async (tx) => {
        const newWorkspace = await tx.workspace.create({
          data: {
            name: trimmedName,
            type: "org",
          },
        });

        const ownerRoleRow = await seedDefaultWorkspaceRoles(tx, newWorkspace.id);

        await tx.membership.create({
          data: {
            userId,
            email,
            workspaceId: newWorkspace.id,
            role: "owner",
            workspaceRoleId: ownerRoleRow.uuid,
            status: "active",
          },
        });

        return { workspace: newWorkspace, ownerRole: ownerRoleRow };
      });

      return {
        statusCode: 201,
        body: JSON.stringify({
          workspace: {
            workspaceId: workspace.id,
            name: workspace.name,
            type: workspace.type,
            role: "owner",
            roleRank: ownerRole.rank,
            roleName: ownerRole.name,
            createdAt: workspace.createdAt,
          },
        }),
      };
    } catch (error) {
      console.error("Failed to create org workspace:", error);
      return serverError("Failed to create org workspace");
    }
  };
