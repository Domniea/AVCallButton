import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { assertWorkspaceMembership } from "../lib/authorization";
import { listInboxThreads } from "../lib/chat/inbox";
import { prisma } from "../lib/prisma";
import { badRequest, forbidden, serverError } from "../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const workspaceId = event.queryStringParameters?.workspaceId;
    if (!workspaceId) return badRequest("workspaceId is required");

    const eventId = event.queryStringParameters?.eventId;
    if (!eventId) return badRequest("eventId is required");

    await assertWorkspaceMembership(userId, workspaceId);

    const threads = await listInboxThreads(prisma, {
      userId,
      workspaceId,
      eventId,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ threads }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") {
        return forbidden("Not a member of this workspace");
      }
    }
    console.error("Failed to list chat inbox:", error);
    return serverError("Failed to list chat inbox");
  }
};
