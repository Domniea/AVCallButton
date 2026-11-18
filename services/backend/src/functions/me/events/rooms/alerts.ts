import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { formatAlert } from "../../../lib/alerts/formatAlert";
import { ACTIVE_ALERT_STATUSES } from "../../../lib/alerts/projection";
import { assertRosterEntry } from "../../../lib/assertRosterEntry";
import { prisma } from "../../../lib/prisma";
import { AlertPriority } from "../../../lib/prismaClient";
import { badRequest, forbidden, notFound, serverError } from "../../../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const eventId = event.pathParameters?.eventId?.trim();
    const roomId = event.pathParameters?.roomId?.trim();
    if (!eventId) return badRequest("Missing eventId");
    if (!roomId) return badRequest("Missing roomId");

    await assertRosterEntry(userId, eventId);

    const room = await prisma.eventRoom.findFirst({
      where: { id: roomId, eventId },
      select: {
        id: true,
        name: true,
        zoneId: true,
        currentPriority: true,
        currentAlertId: true,
        activeAlertCount: true,
        statusUpdatedAt: true,
        zone: { select: { id: true, name: true } },
      },
    });
    if (!room) return notFound("Room not found");

    const alerts = await prisma.alert.findMany({
      where: {
        eventId,
        roomId,
        status: { in: [...ACTIVE_ALERT_STATUSES] },
      },
      orderBy: [{ createdAt: "asc" }],
    });

    alerts.sort((a, b) => {
      const rank = (priority: typeof a.priority) =>
        priority === AlertPriority.HIGH ? 0 : 1;
      const byPriority = rank(a.priority) - rank(b.priority);
      if (byPriority !== 0) return byPriority;
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        room: {
          id: room.id,
          name: room.name,
          zoneId: room.zone?.id ?? null,
          zoneName: room.zone?.name ?? null,
          currentPriority: room.currentPriority,
          currentAlertId: room.currentAlertId,
          activeAlertCount: room.activeAlertCount,
          statusUpdatedAt: room.statusUpdatedAt?.toISOString() ?? null,
        },
        alerts: alerts.map(formatAlert),
      }),
    };
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_ON_ROSTER") {
      return forbidden("Not on event roster");
    }
    console.error("Failed to load room alerts:", error);
    return serverError("Failed to load room alerts");
  }
};
