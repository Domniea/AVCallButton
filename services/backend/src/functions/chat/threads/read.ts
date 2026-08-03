import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { assertThreadMember } from "../../lib/chat/assertThreadMember";
import { markThreadRead } from "../../lib/chat/read";
import { prisma } from "../../lib/prisma";
import {
  badRequest,
  forbidden,
  notFound,
  serverError,
} from "../../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const threadId = event.pathParameters?.threadId;
    if (!threadId) return badRequest("Missing threadId");
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

    const messageId = (requestBody as Record<string, unknown>).messageId;
    if (typeof messageId !== "string" || !messageId.trim()) {
      return badRequest("messageId is required");
    }

    await assertThreadMember(userId, threadId);

    const member = await markThreadRead(prisma, {
      threadId,
      userId,
      messageId: messageId.trim(),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        threadId,
        lastReadMessageId: member.lastReadMessageId,
      }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_THREAD_MEMBER") {
        return forbidden("Not a member of this thread");
      }
      if (error.message === "MESSAGE_NOT_FOUND") {
        return notFound("Message not found in this thread");
      }
    }
    console.error("Failed to mark thread read:", error);
    return serverError("Failed to mark thread read");
  }
};
