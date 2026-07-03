import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { prisma } from "../../lib/prisma";
import { authorize } from "../../lib/authorization";
import { badRequest, forbidden, notFound, serverError } from "../../lib/responses";

function parseRoomName(value: unknown): string | null {
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
    if (!eventId) return badRequest("Missing event id");
    if (!event.body) return badRequest("Missing request body");

    let requestBody: unknown;
    try {
      requestBody = JSON.parse(event.body);
    } catch {
      return badRequest("Invalid JSON");
    }
    if (typeof requestBody !== "object" || requestBody === null) return badRequest("Invalid body");
    const body = requestBody as Record<string, unknown>;

    const name = parseRoomName(body.name);
    if (!name) return badRequest("Invalid room name");

    const dbEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { workspaceId: true },
    });
    if (!dbEvent) return notFound("Event not found");
    await authorize(userId, dbEvent.workspaceId, "event:update");

    const zoneId = typeof body.zoneId === "string" && body.zoneId.trim() ? body.zoneId : null;
    if (zoneId) {
      const zone = await prisma.eventZone.findFirst({ where: { id: zoneId, eventId } });
      if (!zone) return badRequest("Invalid zoneId for this event");
    }

    const sortOrder =
      typeof body.sortOrder === "number" && Number.isInteger(body.sortOrder)
        ? body.sortOrder
        : await prisma.eventRoom.count({ where: { eventId } });

    const room = await prisma.eventRoom.create({
      data: { eventId, zoneId, name, sortOrder },
      include: { zone: true },
    });

    return { statusCode: 201, body: JSON.stringify({ room }) };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") return forbidden("Not a member of this workspace");
      if (error.message === "FORBIDDEN") return forbidden("Insufficient permissions");
    }
    console.error("Failed to create room:", error);
    return serverError("Failed to create room");
  }
};
