import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { prisma } from "../lib/prisma";
import { membershipToDashboardWorkspace } from "../lib/mappers/workspace";
import { serverError } from "../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const memberships = await prisma.membership.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            events: {
              orderBy: { createdAt: "desc" },
              take: 3,
            },
            _count: {
              select: { events: true },
            },
          },
        },
        workspaceRole: true,
      },
    });

    const workspaces = memberships.map(membershipToDashboardWorkspace);

    return {
      statusCode: 200,
      body: JSON.stringify({ workspaces }),
    };
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    return serverError("Failed to load dashboard");
  }
};
