import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
} from "aws-lambda";

import { prisma } from "../lib/prisma";
import { badRequest, serverError } from "../lib/responses";

const DEFAULT_ROLES = [
  { rank: 2, name: "GUEST" },
  { rank: 4, name: "CREW" },
  { rank: 6, name: "LEAD" },
  { rank: 8, name: "MANAGER" },
  { rank: 10, name: "OWNER" },
] as const;

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer =
  async (event) => {
    try {
      const claims = event.requestContext.authorizer.jwt.claims;
      const userId = claims.sub as string;
      const email = typeof claims.email === 'string' ? claims.email : null;

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
        
        await tx.workspaceRole.createMany({
          data: DEFAULT_ROLES.map((r) => ({
            workspaceId: newWorkspace.id,
            rank: r.rank,
            name: r.name,
            description: "",
          })),
        });

        const ownerRole = await tx.workspaceRole.findUnique({
          where: {
            workspaceId_rank: {
              workspaceId: newWorkspace.id,
              rank: 10,
            },
          },
        });
        
        if (!ownerRole) {
          throw new Error("Failed to seed owner workspace role");
        }

        await tx.membership.create({
          data: {
            userId,
            email,
            workspaceId: newWorkspace.id,
            role: "owner", // temp compatibility field, if you still keep it
            workspaceRoleId: ownerRole.uuid,
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
