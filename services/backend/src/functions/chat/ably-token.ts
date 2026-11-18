import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { eventAlertBoardChannelName } from "../lib/alerts/ably";
import { assertRosterEntry } from "../lib/assertRosterEntry";
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
    const purpose =
      typeof body.purpose === "string" ? body.purpose.trim() : "chat";

    if (!eventId) return badRequest("eventId is required");

    if (purpose === "alert-board") {
      await assertRosterEntry(userId, eventId);
      const channelNames = [eventAlertBoardChannelName(eventId)];
      const tokenRequest = await createChatAblyTokenRequest({
        userId,
        channelNames,
        clientIdSuffix: "alert-board",
      });
      return {
        statusCode: 200,
        body: JSON.stringify({
          tokenRequest,
          channels: channelNames,
        }),
      };
    }

    const channelNames = await resolveAblySubscribeChannels({
      userId,
      eventId,
      threadId: threadId || undefined,
    });

    const tokenRequest = await createChatAblyTokenRequest({
      userId,
      channelNames,
      clientIdSuffix: threadId ? `thread:${threadId}` : "inbox",
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
      if (error.message === "NOT_ON_ROSTER") {
        return forbidden("Not on event roster");
      }
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
