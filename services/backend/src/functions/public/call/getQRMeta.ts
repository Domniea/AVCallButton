import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

import { isEventAcceptingCalls } from "../../lib/events/eventCallStatus";
import { prisma } from "../../lib/prisma";
import { badRequest, notFound, serverError } from "../../lib/responses";

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const callToken = event.pathParameters?.callToken?.trim();
    if (!callToken) return badRequest("Missing call token");

    const room = await prisma.eventRoom.findUnique({
      where: { callToken },
      select: {
        name: true,
        event: {
          select: { name: true, status: true, endTime: true },
        },
        zone: {
          select: { name: true },
        },
      },
    });

    if (!room) return notFound("Call link not found");

    return {
      statusCode: 200,
      body: JSON.stringify({
        acceptingCalls: isEventAcceptingCalls(room.event),
        event: { name: room.event.name },
        room: { name: room.name },
        zone: room.zone ? { name: room.zone.name } : null,
      }),
    };
  } catch (error) {
    console.error("Failed to load QR call meta:", error);
    return serverError("Failed to load call page");
  }
};
