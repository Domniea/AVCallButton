import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { assertRosterEntry } from "../../lib/assertRosterEntry";
import {
  formatAssignmentDetail,
  formatEventMeta,
  formatMyCoverage,
} from "../../lib/mappers/me";
import { prisma } from "../../lib/prisma";
import { badRequest, forbidden, serverError } from "../../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const eventId = event.pathParameters?.eventId;
    if (!eventId) {
      return badRequest("Missing eventId");
    }

    const entry = await assertRosterEntry(userId, eventId);
    const membershipId = entry.membershipId;

    const [zoneCoverageRows, roomCoverageRows, eventRooms] = await Promise.all([
      prisma.eventZoneCoverage.findMany({
        where: { membershipId, zone: { eventId } },
        include: { zone: true },
        orderBy: [{ zone: { sortOrder: "asc" } }, { createdAt: "asc" }],
      }),
      prisma.eventRoomCoverage.findMany({
        where: { membershipId, room: { eventId } },
        include: { room: { include: { zone: true } } },
        orderBy: [{ room: { sortOrder: "asc" } }, { createdAt: "asc" }],
      }),
      prisma.eventRoom.findMany({
        where: { eventId },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    const coverage = formatMyCoverage({
      zoneCoverageRows,
      roomCoverageRows,
      eventRooms,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        assignment: formatAssignmentDetail(entry),
        event: formatEventMeta(entry.event),
        workspace: {
          id: entry.event.workspace.id,
          name: entry.event.workspace.name,
        },
        ...coverage,
      }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_ON_ROSTER") {
        return forbidden("Not on event roster");
      }
    }
    console.error("Failed to load my event assignment:", error);
    return serverError("Failed to load my event assignment");
  }
};
