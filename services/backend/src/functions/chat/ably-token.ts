import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import {
  createChatAblyTokenRequest,
  resolveAblySubscribeChannels,
} from "../lib/chat/ably";
import {
  badRequest,
  forbidden,
  serverError,
} from "../lib/responses";

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
    const eventId =
      typeof body.eventId === "string" ? body.eventId.trim() : "";
    const threadId =
      typeof body.threadId === "string" ? body.threadId.trim() : "";

    if (!eventId) return badRequest("eventId is required");

    const channelNames = await resolveAblySubscribeChannels({
      userId,
      eventId,
      threadId: threadId || undefined,
    });

    const tokenRequest = await createChatAblyTokenRequest({
      userId,
      channelNames,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        tokenRequest,
        channels: channelNames,
      }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_THREAD_MEMBER") {
        return forbidden("Not a member of this thread");
      }
      if (error.message === "NO_CHAT_CHANNELS") {
        return badRequest("No chat channels available for this event");
      }
      if (error.message === "ABLY_NOT_CONFIGURED") {
        return serverError("Ably is not configured");
      }
    }
    console.error("Failed to create Ably token:", error);
    return serverError("Failed to create Ably token");
  }
};
