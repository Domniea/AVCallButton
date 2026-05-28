import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { prisma } from "../../lib/prisma";
import { authorize } from "../../lib/authorization";
import { badRequest, forbidden, notFound, serverError } from "../../lib/responses";

function parseRoomName(value: unknown): string | null {
  if (value === undefined) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 100) return null;
  return trimmed;
}

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const eventId = event.pathParameters?.eventId;
    const roomId = event.pathParameters?.roomId;
    if (!eventId) return badRequest("Missing event id");
    if (!roomId) return badRequest("Missing room id");
    if (!event.body) return badRequest("Missing request body");

    let parsed: unknown;
    try {
      parsed = JSON.parse(event.body);
    } catch {
      return badRequest("Invalid JSON");
    }
    if (typeof parsed !== "object" || parsed === null) return badRequest("Invalid body");
    const body = parsed as Record<string, unknown>;

    const room = await prisma.eventRoom.findFirst({
      where: { id: roomId, eventId },
      include: { event: { select: { workspaceId: true } } },
    });
    if (!room) return notFound("Room not found");
    await authorize(userId, room.event.workspaceId, "event:update");

    const updates: { name?: string; zoneId?: string | null; sortOrder?: number } = {};

    if (Object.prototype.hasOwnProperty.call(body, "name")) {
      const name = parseRoomName(body.name);
      if (!name) return badRequest("Invalid room name");
      updates.name = name;
    }

    if (Object.prototype.hasOwnProperty.call(body, "zoneId")) {
      if (body.zoneId === null || body.zoneId === "") {
        updates.zoneId = null;
      } else if (typeof body.zoneId === "string") {
        const zone = await prisma.eventZone.findFirst({
          where: { id: body.zoneId, eventId },
          select: { id: true },
        });
        if (!zone) return badRequest("Invalid zoneId for this event");
        updates.zoneId = zone.id;
      } else {
        return badRequest("Invalid zoneId");
      }
    }

    if (Object.prototype.hasOwnProperty.call(body, "sortOrder")) {
      if (typeof body.sortOrder !== "number" || !Number.isInteger(body.sortOrder)) {
        return badRequest("Invalid sortOrder");
      }
      updates.sortOrder = body.sortOrder;
    }

    if (!Object.keys(updates).length) return badRequest("No valid fields to update");

    const updated = await prisma.eventRoom.update({
      where: { id: roomId },
      data: updates,
      include: { zone: true },
    });

    return { statusCode: 200, body: JSON.stringify({ room: updated }) };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") return forbidden("Not a member of this workspace");
      if (error.message === "FORBIDDEN") return forbidden("Insufficient permissions");
    }
    console.error("Failed to update room:", error);
    return serverError("Failed to update room");
  }
};
