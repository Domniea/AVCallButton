import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { prisma } from "../../../lib/prisma";
import { authorize } from "../../../lib/authorization";
import { badRequest, forbidden, notFound, serverError } from "../../../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const eventId = event.pathParameters?.eventId;
    const roomId = event.pathParameters?.roomId;
    const membershipId = event.pathParameters?.membershipId;
    if (!eventId) return badRequest("Missing event id");
    if (!roomId) return badRequest("Missing room id");
    if (!membershipId) return badRequest("Missing membership id");

    const room = await prisma.eventRoom.findFirst({
      where: { id: roomId, eventId },
      include: { event: { select: { workspaceId: true } } },
    });
    if (!room) return notFound("Room not found");

    await authorize(userId, room.event.workspaceId, "event:assignStaff");

    const existing = await prisma.eventRoomAssignment.findFirst({
      where: { roomId, membershipId },
      select: { id: true },
    });
    if (!existing) return notFound("Room assignment not found");

    await prisma.eventRoomAssignment.delete({ where: { id: existing.id } });
    return {
      statusCode: 200,
      body: JSON.stringify({ deleted: true, roomId, membershipId }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") return forbidden("Not a member of this workspace");
      if (error.message === "FORBIDDEN") return forbidden("Insufficient permissions");
    }
    console.error("Failed to delete room assignment:", error);
    return serverError("Failed to delete room assignment");
  }
};
