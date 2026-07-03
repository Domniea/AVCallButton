import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { prisma } from "../../lib/prisma";
import { authorize } from "../../lib/authorization";
import { badRequest, forbidden, notFound, serverError } from "../../lib/responses";
import {
  parseRoomIds,
  validateRoomIdsForEvent,
} from "../../lib/events/zoneRooms";

function parseName(value: unknown): string | null {
  if (value === undefined) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 80) return null;
  return trimmed;
}

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const eventId = event.pathParameters?.eventId;
    const zoneId = event.pathParameters?.zoneId;
    if (!eventId) return badRequest("Missing event id");
    if (!zoneId) return badRequest("Missing zone id");
    if (!event.body) return badRequest("Missing request body");

    let requestBody: unknown;
    try {
      requestBody = JSON.parse(event.body);
    } catch {
      return badRequest("Invalid JSON");
    }
    if (typeof requestBody !== "object" || requestBody === null) return badRequest("Invalid body");
    const body = requestBody as Record<string, unknown>;

    const zone = await prisma.eventZone.findFirst({
      where: { id: zoneId, eventId },
      include: { event: { select: { workspaceId: true } } },
    });
    if (!zone) return notFound("Zone not found");

    await authorize(userId, zone.event.workspaceId, "event:update");

    const zoneUpdates: { name?: string; sortOrder?: number } = {};
    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      const name = parseName(body.name);
      if (!name) return badRequest("Invalid zone name");
      zoneUpdates.name = name;
    }
    if (Object.prototype.hasOwnProperty.call(body, "sortOrder")) {
      if (typeof body.sortOrder !== "number" || !Number.isInteger(body.sortOrder)) {
        return badRequest("Invalid sortOrder");
      }
      zoneUpdates.sortOrder = body.sortOrder;
    }

    const hasRoomIds = Object.prototype.hasOwnProperty.call(body, "roomIds");
    let roomIds: string[] | undefined;
    if (hasRoomIds) {
      const parsedRoomIds = parseRoomIds(body.roomIds);
      if (parsedRoomIds === null) return badRequest("Invalid roomIds");
      roomIds = parsedRoomIds;

      const roomIdsError = await validateRoomIdsForEvent(eventId, roomIds);
      if (roomIdsError) return badRequest(roomIdsError);
    }

    if (!Object.keys(zoneUpdates).length && !hasRoomIds) {
      return badRequest("No valid fields to update");
    }

    await prisma.$transaction(async (tx) => {
      if (Object.keys(zoneUpdates).length) {
        await tx.eventZone.update({
          where: { id: zoneId },
          data: zoneUpdates,
        });
      }

      if (hasRoomIds && roomIds !== undefined) {
        // Rooms previously in this zone but not in the new list become unassigned.
        if (roomIds.length === 0) {
          await tx.eventRoom.updateMany({
            where: { eventId, zoneId },
            data: { zoneId: null },
          });
        } else {
          await tx.eventRoom.updateMany({
            where: { eventId, zoneId, id: { notIn: roomIds } },
            data: { zoneId: null },
          });
          await tx.eventRoom.updateMany({
            where: { eventId, id: { in: roomIds } },
            data: { zoneId },
          });
        }
      }
    });

    const updated = await prisma.eventZone.findUnique({
      where: { id: zoneId },
      include: {
        rooms: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    return { statusCode: 200, body: JSON.stringify({ zone: updated }) };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") return forbidden("Not a member of this workspace");
      if (error.message === "FORBIDDEN") return forbidden("Insufficient permissions");
    }
    console.error("Failed to update zone:", error);
    return serverError("Failed to update zone");
  }
};
