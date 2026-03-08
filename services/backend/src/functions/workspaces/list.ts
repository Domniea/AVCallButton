import type {
  APIGatewayProxyHandlerV2WithJWTAuthorizer,
} from "aws-lambda";

import { prisma } from "../lib/prisma";
import { serverError } from "../lib/responses";


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

          const membership = await tx.membership.create({
            data: {
              userId,
              email,
              workspaceId: workspace.id,
              role: "owner",
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