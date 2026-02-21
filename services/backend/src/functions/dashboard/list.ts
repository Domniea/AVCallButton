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
  
        const memberships = await prisma.membership.findMany({
          where: { userId },
          include: {
            workspace: {
              include: {
                shows: {
                  orderBy: { createdAt: "desc" },
                  take: 3,
                },
                _count: {
                  select: { shows: true },
                },
              },
            },
          },
        });
  
        const workspaces = memberships.map((m) => ({
          workspaceId: m.workspace.id,
          name: m.workspace.name,
          type: m.workspace.type,
          role: m.role,
          showCount: m.workspace._count.shows,
          recentShows: m.workspace.shows,
        }));
  
        return {
          statusCode: 200,
          body: JSON.stringify({ workspaces }),
        };
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        return serverError("Failed to load dashboard");
      }
    };