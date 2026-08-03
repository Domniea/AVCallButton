import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { assertThreadMember } from "../../../lib/chat/assertThreadMember";
import {
  listThreadMessages,
  parseMessageLimit,
} from "../../../lib/chat/messages";
import { chatMessageToApi } from "../../../lib/mappers/chat";
import { prisma } from "../../../lib/prisma";
import { badRequest, forbidden, serverError } from "../../../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const threadId = event.pathParameters?.threadId;
    if (!threadId) return badRequest("Missing threadId");

    const limit = parseMessageLimit(event.queryStringParameters?.limit);
    if (limit === null) return badRequest("Invalid limit");

    const before = event.queryStringParameters?.before || undefined;
    const after = event.queryStringParameters?.after || undefined;
    if (before && after) {
      return badRequest("Use only one of before or after");
    }

    await assertThreadMember(userId, threadId);

    const { messages, hasMore } = await listThreadMessages(prisma, {
      threadId,
      limit,
      before,
      after,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        messages: messages.map(chatMessageToApi),
        hasMore,
      }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_THREAD_MEMBER") {
        return forbidden("Not a member of this thread");
      }
      if (
        error.message === "INVALID_CURSOR" ||
        error.message === "INVALID_BEFORE_CURSOR" ||
        error.message === "INVALID_AFTER_CURSOR"
      ) {
        return badRequest("Invalid cursor");
      }
    }
    console.error("Failed to list chat messages:", error);
    return serverError("Failed to list chat messages");
  }
};
