import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { publishChatMessageCreated } from "../../../lib/chat/ably";
import { assertThreadMember } from "../../../lib/chat/assertThreadMember";
import {
  createThreadMessage,
  parseMessageBody,
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

    const body = parseMessageBody((requestBody as Record<string, unknown>).body);
    if (!body) {
      return badRequest("Message body must be 1–4000 characters");
    }

    await assertThreadMember(userId, threadId);

    const message = await prisma.$transaction((tx) =>
      createThreadMessage(tx, {
        threadId,
        senderId: userId,
        body,
      }),
    );

    const apiMessage = chatMessageToApi(message);
    await publishChatMessageCreated({
      threadId,
      message: apiMessage,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ message: apiMessage }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_THREAD_MEMBER") {
        return forbidden("Not a member of this thread");
      }
    }
    console.error("Failed to create chat message:", error);
    return serverError("Failed to create chat message");
  }
};
