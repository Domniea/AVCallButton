import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
} from "aws-lambda";

import { prisma } from "../lib/prisma";
import { serverError } from "../lib/responses";

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
      

      let personalMembership = await prisma.membership.findFirst({
        where: {
          userId,
          workspace: {
            type: "personal",
          },
        },
        include: {
          workspace: true,
        },
      });

      if (!personalMembership) {
        const created = await prisma.$transaction(async (tx) => {
          const workspace = await tx.workspace.create({
            data: {
              name: `Personal – ${userId}`,
              type: "personal",
            },
          });

          await tx.workspaceRole.createMany({
            data: DEFAULT_ROLES.map((r) => ({
              workspaceId: workspace.id,
              rank: r.rank,
              name: r.name,
              description: "",
            })),
          });

          const ownerRole = await tx.workspaceRole.findUnique({
            where: {
              workspaceId_rank: {
                workspaceId: workspace.id,
                rank: 10,
              },
            },
          });

          if (!ownerRole) {
            throw new Error("Failed to seed owner workspace role");
          }

          const membership = await tx.membership.create({
            data: {
              userId,
              email,
              workspaceId: workspace.id,
              role: "owner",
              workspaceRoleId: ownerRole.uuid,
              status: "active",
            },
            include: { workspace: true },
          });

          return membership;
        });

        personalMembership = created;
      }

      const memberships = await prisma.membership.findMany({
        where: { userId },
        include: {
          workspace: {
            include: { _count: { select: { shows: true } } },
          },
        },
      });

      return {
        statusCode: 200,
        body: JSON.stringify({
          workspaces: memberships.map((m) => ({
            workspaceId: m.workspace.id,
            name: m.workspace.name,
            type: m.workspace.type,
            role: m.role,
            createdAt: m.workspace.createdAt,
            showCount: m.workspace._count.shows,
          })),
        }),
      };
    } catch (error) {
      console.error("Failed to list workspaces:", error);
      return serverError("Failed to list workspaces");
    }
  };