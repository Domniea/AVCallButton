import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { prisma } from "../../lib/prisma";
import { authorize } from "../../lib/authorization";
import { badRequest, forbidden, notFound, serverError } from "../../lib/responses";
import {
  parseRoomIds,
  validateRoomIdsForEvent,
} from "../../lib/events/zoneRooms";

const ZONE_NAME_MIN = 1;
const ZONE_NAME_MAX = 80;

function toZoneName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length < ZONE_NAME_MIN || trimmed.length > ZONE_NAME_MAX) return null;
  return trimmed;
}

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const eventId = event.pathParameters?.eventId;
    if (!eventId) return badRequest("Missing event id");
    if (!event.body) return badRequest("Missing request body");

    let parsed: unknown;
    try {
      parsed = JSON.parse(event.body);
    } catch {
      return badRequest("Invalid JSON");
    }
    if (typeof parsed !== "object" || parsed === null) return badRequest("Invalid body");

    const body = parsed as Record<string, unknown>;
    const dbEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { workspaceId: true },
    });
    if (!dbEvent) return notFound("Event not found");

    await authorize(userId, dbEvent.workspaceId, "event:update");

    let name = toZoneName(body.name);
    if (!name) {
      const count = await prisma.eventZone.count({ where: { eventId } });
      name = `Zone ${String.fromCharCode(65 + (count % 26))}`;
    }

    const sortOrder =
      typeof body.sortOrder === "number" && Number.isInteger(body.sortOrder)
        ? body.sortOrder
        : await prisma.eventZone.count({ where: { eventId } });

    let roomIds: string[] = [];
    if (Object.prototype.hasOwnProperty.call(body, "roomIds")) {
      const parsedRoomIds = parseRoomIds(body.roomIds);
      if (parsedRoomIds === null) return badRequest("Invalid roomIds");
      roomIds = parsedRoomIds;
      const roomIdsError = await validateRoomIdsForEvent(eventId, roomIds);
      if (roomIdsError) return badRequest(roomIdsError);
    }

    const zone = await prisma.$transaction(async (tx) => {
      const created = await tx.eventZone.create({
        data: { eventId, name, sortOrder },
      });

      if (roomIds.length > 0) {
        await tx.eventRoom.updateMany({
          where: { eventId, id: { in: roomIds } },
          data: { zoneId: created.id },
        });
      }

      return tx.eventZone.findUnique({
        where: { id: created.id },
        include: {
          rooms: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      });
    });

    return { statusCode: 201, body: JSON.stringify({ zone }) };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") return forbidden("Not a member of this workspace");
      if (error.message === "FORBIDDEN") return forbidden("Insufficient permissions");
    }
    console.error("Failed to create zone:", error);
    return serverError("Failed to create zone");
  }
};
