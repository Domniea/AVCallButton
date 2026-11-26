import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { formatAlert } from "../../../lib/alerts/formatAlert";
import { ACTIVE_ALERT_STATUSES } from "../../../lib/alerts/projection";
import { sortEventAlerts } from "../../../lib/alerts/sortEventAlerts";
import { assertRosterEntry } from "../../../lib/assertRosterEntry";
import { prisma } from "../../../lib/prisma";
import { AlertStatus } from "../../../lib/prismaClient";
import { badRequest, forbidden, serverError } from "../../../lib/responses";

/** Cap recent resolved rows so All stays lightweight. */
const RECENT_RESOLVED_LIMIT = 50;

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const eventId = event.pathParameters?.eventId?.trim();
    if (!eventId) return badRequest("Missing eventId");

    await assertRosterEntry(userId, eventId);

    const [activeRows, resolvedRows] = await Promise.all([
      prisma.alert.findMany({
        where: {
          eventId,
          status: { in: [...ACTIVE_ALERT_STATUSES] },
        },
        include: {
          room: {
            select: {
              id: true,
              name: true,
              zoneId: true,
              zone: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.alert.findMany({
        where: {
          eventId,
          status: AlertStatus.RESOLVED,
        },
        include: {
          room: {
            select: {
              id: true,
              name: true,
              zoneId: true,
              zone: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: [{ resolvedAt: "desc" }],
        take: RECENT_RESOLVED_LIMIT,
      }),
    ]);

    const sorted = sortEventAlerts([...activeRows, ...resolvedRows]);

    const alerts = sorted.map((row) => ({
      ...formatAlert(row),
      roomName: row.room.name,
      zoneId: row.room.zone?.id ?? row.room.zoneId ?? null,
      zoneName: row.room.zone?.name ?? null,
    }));

    const counts = {
      active: activeRows.length,
      pending: activeRows.filter((row) => row.priority === "MEDIUM").length,
      urgent: activeRows.filter((row) => row.priority === "HIGH").length,
      resolved: resolvedRows.length,
      all: activeRows.length + resolvedRows.length,
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ counts, alerts }),
    };
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_ON_ROSTER") {
      return forbidden("Not on event roster");
    }
    console.error("Failed to load event alerts:", error);
    return serverError("Failed to load event alerts");
  }
};
