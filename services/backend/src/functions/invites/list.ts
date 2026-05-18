import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { InviteStatus } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { authorize } from "../lib/authorization";
import { inviteToApi } from "../lib/mappers/invite";
import { badRequest, forbidden, serverError } from "../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const workspaceId = event.pathParameters?.workspaceId as string;

    const membership = await authorize(userId, workspaceId, "workspace:invite");

    const rows = await prisma.invite.findMany({
      where: {
        workspaceId,
        status: InviteStatus.PENDING,
      },
      include: { workspaceRole: true },
      orderBy: { createdAt: "desc" },
    });

    const invites = rows.map((inv) => inviteToApi(inv, inv.workspaceRole));

    return {
      statusCode: 200,
      body: JSON.stringify({ invites }),
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
    console.error("Failed to list invites:", error);
    return serverError("Failed to list invites");
  }
};
