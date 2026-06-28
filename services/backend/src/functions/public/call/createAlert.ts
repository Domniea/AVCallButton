import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { isEventAcceptingCalls } from "../../lib/events/eventCallStatus";
import { prisma } from "../../lib/prisma";
import { resolveAlertRecipients } from "../../lib/resolvers/alerts/resolveAlertRecipients";
import {
  badRequest,
  forbidden,
  notFound,
  serverError,
  tooManyRequests,
} from "../../lib/responses";

const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW_MS = 60_000;
const MESSAGE_MAX_LENGTH = 500;

function parseMessage(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > MESSAGE_MAX_LENGTH) return null;
  return trimmed;
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const callToken = event.pathParameters?.callToken?.trim();
    if (!callToken) return badRequest("Missing call token");
    if (!event.body) return badRequest("Missing request body");

    let parsed: unknown;
    try {
      parsed = JSON.parse(event.body);
    } catch {
      return badRequest("Invalid JSON");
    }
    if (typeof parsed !== "object" || parsed === null) {
      return badRequest("Invalid body");
    }

    const message = parseMessage((parsed as Record<string, unknown>).message);
    if (
      (parsed as Record<string, unknown>).message != null &&
      (parsed as Record<string, unknown>).message !== "" &&
      message === null
    ) {
      return badRequest("Invalid message");
    }

    const room = await prisma.eventRoom.findUnique({
      where: { callToken },
      select: {
        id: true,
        eventId: true,
        zoneId: true,
        event: { select: { status: true, endTime: true } },
      },
    });

    if (!room) return notFound("Call link not found");
    if (!isEventAcceptingCalls(room.event)) {
      return forbidden("This event is not accepting calls");
    }

    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
    const recentCount = await prisma.alert.count({
      where: { roomId: room.id, createdAt: { gte: since } },
    });
    if (recentCount >= RATE_LIMIT_MAX) {
      return tooManyRequests("Too many help requests. Please wait a moment.");
    }

    const alert = await prisma.alert.create({
      data: {
        eventId: room.eventId,
        roomId: room.id,
        kind: "HELP",
        message,
      },
    });

    const recipients = await resolveAlertRecipients({
      eventId: room.eventId,
      roomId: room.id,
      zoneId: room.zoneId,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        alertId: alert.id,
        notifiedCount: recipients.length,
      }),
    };
  } catch (error) {
    console.error("Failed to create public alert:", error);
    return serverError("Failed to send help request");
  }
};
