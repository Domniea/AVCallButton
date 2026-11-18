import type { APIGatewayProxyHandlerV2 } from "aws-lambda";
import type { AlertPriority as AlertPriorityType } from "@prisma/client";

import { publishAlertBoardInvalidated } from "../../lib/alerts/ably";
import { createRoomAlert } from "../../lib/alerts/createRoomAlert";
import { isEventAcceptingCalls } from "../../lib/events/eventCallStatus";
import { prisma } from "../../lib/prisma";
import { AlertPriority } from "../../lib/prismaClient";
import { notifyUsers } from "../../lib/push/notifyUsers";
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

/** Defaults to HIGH so existing single-button clients keep current urgency. */
function parsePriority(value: unknown): AlertPriorityType | null {
  if (value === undefined || value === null || value === "") {
    return AlertPriority.HIGH;
  }
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  if (normalized === AlertPriority.HIGH) return AlertPriority.HIGH;
  if (normalized === AlertPriority.MEDIUM) return AlertPriority.MEDIUM;
  return null;
}

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const callToken = event.pathParameters?.callToken?.trim();
    if (!callToken) return badRequest("Missing call token");
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
    const message = parseMessage(body.message);
    if (body.message != null && body.message !== "" && message === null) {
      return badRequest("Invalid message");
    }

    const priority = parsePriority(body.priority);
    if (priority === null) {
      return badRequest("Invalid priority");
    }

    const room = await prisma.eventRoom.findUnique({
      where: { callToken },
      select: {
        id: true,
        name: true,
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

    const { alert, projection } = await createRoomAlert({
      eventId: room.eventId,
      roomId: room.id,
      priority,
      message,
    });

    await publishAlertBoardInvalidated({
      eventId: room.eventId,
      roomId: room.id,
      alertId: alert.id,
      action: "created",
      updatedAt: new Date().toISOString(),
    });

    const recipients = await resolveAlertRecipients({
      eventId: room.eventId,
      roomId: room.id,
      zoneId: room.zoneId,
    });

    const userIds = [...new Set(recipients.map((recipient) => recipient.userId))];
    const priorityLabel = priority === AlertPriority.HIGH ? "Urgent help" : "Help when available";
    try {
      await notifyUsers({
        userIds,
        notification: {
          title: `${priorityLabel} — ${room.name}`,
          body: message ?? "A guest requested help",
          data: {
            alertId: alert.id,
            eventId: room.eventId,
            roomId: room.id,
            priority,
          },
        },
      });
    } catch (error) {
      console.error("Failed to send alert push notifications:", error);
    }

    return {
      statusCode: 201,
      body: JSON.stringify({
        alertId: alert.id,
        priority: alert.priority,
        notifiedCount: recipients.length,
        room: {
          currentPriority: projection.currentPriority,
          currentAlertId: projection.currentAlertId,
          activeAlertCount: projection.activeAlertCount,
        },
      }),
    };
  } catch (error) {
    console.error("Failed to create public alert:", error);
    return serverError("Failed to send help request");
  }
};
