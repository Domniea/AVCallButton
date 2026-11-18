import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { ACTIVE_ALERT_STATUSES } from "../../lib/alerts/projection";
import { sortAlertBoardRooms } from "../../lib/alerts/sortAlertBoardRooms";
import { assertRosterEntry } from "../../lib/assertRosterEntry";
import { prisma } from "../../lib/prisma";
import { badRequest, forbidden, serverError } from "../../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const eventId = event.pathParameters?.eventId?.trim();
    if (!eventId) return badRequest("Missing eventId");

    await assertRosterEntry(userId, eventId);

    const rooms = await prisma.eventRoom.findMany({
      where: { eventId },
      select: {
        id: true,
        name: true,
        zoneId: true,
        sortOrder: true,
        currentPriority: true,
        currentAlertId: true,
        activeAlertCount: true,
        statusUpdatedAt: true,
        zone: { select: { id: true, name: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });

    const drivingIds = rooms
      .map((room) => room.currentAlertId)
      .filter((id): id is string => typeof id === "string");

    const drivingAlerts =
      drivingIds.length === 0
        ? []
        : await prisma.alert.findMany({
            where: {
              id: { in: drivingIds },
              status: { in: [...ACTIVE_ALERT_STATUSES] },
            },
            select: {
              id: true,
              priority: true,
              message: true,
              status: true,
              createdAt: true,
            },
          });

    const drivingById = new Map(
      drivingAlerts.map((alert) => [alert.id, alert] as const),
    );

    const boardRooms = sortAlertBoardRooms(
      rooms.map((room) => {
        const driving =
          room.currentAlertId != null
            ? (drivingById.get(room.currentAlertId) ?? null)
            : null;

        return {
          id: room.id,
          name: room.name,
          zoneId: room.zone?.id ?? null,
          zoneName: room.zone?.name ?? null,
          currentPriority: room.currentPriority,
          currentAlertId: room.currentAlertId,
          activeAlertCount: room.activeAlertCount,
          statusUpdatedAt: room.statusUpdatedAt?.toISOString() ?? null,
          drivingAlert: driving
            ? {
                id: driving.id,
                priority: driving.priority,
                message: driving.message,
                status: driving.status,
                createdAt: driving.createdAt.toISOString(),
              }
            : null,
        };
      }),
    );

    const counts = {
      urgent: boardRooms.filter((room) => room.currentPriority === "HIGH")
        .length,
      pending: boardRooms.filter((room) => room.currentPriority === "MEDIUM")
        .length,
      clear: boardRooms.filter((room) => room.currentPriority === null).length,
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ counts, rooms: boardRooms }),
    };
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_ON_ROSTER") {
      return forbidden("Not on event roster");
    }
    console.error("Failed to load alert board:", error);
    return serverError("Failed to load alert board");
  }
};
