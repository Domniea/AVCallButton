import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { assertWorkspaceMembership } from "../../lib/authorization";
import { getOrCreateDmThread } from "../../lib/chat/threads";
import { chatThreadToApi } from "../../lib/mappers/chat";
import { prisma } from "../../lib/prisma";
import {
  badRequest,
  forbidden,
  notFound,
  serverError,
} from "../../lib/responses";

const DM_BAD_REQUEST_MESSAGES = new Set([
  "Cannot create a DM with yourself",
  "Both users must be on the event roster",
]);

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    if (!event.body) return badRequest("Missing request body");

    let requestBody: unknown;
    try {
      requestBody = JSON.parse(event.body);
    } catch {
      return badRequest("Invalid JSON");
    }
    if (typeof requestBody !== "object" || requestBody === null) {
      return badRequest("Invalid body");
    }

    const body = requestBody as Record<string, unknown>;
    const workspaceId =
      typeof body.workspaceId === "string" ? body.workspaceId.trim() : "";
    const eventId =
      typeof body.eventId === "string" ? body.eventId.trim() : "";
    const otherUserId =
      typeof body.otherUserId === "string" ? body.otherUserId.trim() : "";

    if (!workspaceId) return badRequest("workspaceId is required");
    if (!eventId) return badRequest("eventId is required");
    if (!otherUserId) return badRequest("otherUserId is required");

    await assertWorkspaceMembership(userId, workspaceId);

    const thread = await getOrCreateDmThread(prisma, {
      workspaceId,
      eventId,
      userIdA: userId,
      userIdB: otherUserId,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ thread: chatThreadToApi(thread) }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") {
        return forbidden("Not a member of this workspace");
      }
      if (error.message === "Event not found") {
        return notFound("Event not found");
      }
      if (DM_BAD_REQUEST_MESSAGES.has(error.message)) {
        return badRequest(error.message);
      }
    }
    console.error("Failed to open DM thread:", error);
    return serverError("Failed to open DM thread");
  }
};
