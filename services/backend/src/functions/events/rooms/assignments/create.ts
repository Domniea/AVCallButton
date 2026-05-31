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
    const membershipId =
      typeof body.membershipId === "string" && body.membershipId.trim()
        ? body.membershipId
        : null;
    if (!membershipId) return badRequest("membershipId is required");

    const room = await prisma.eventRoom.findFirst({
      where: { id: roomId, eventId },
      include: { event: { select: { workspaceId: true } } },
    });
    if (!room) return notFound("Room not found");

    await authorize(userId, room.event.workspaceId, "event:assignStaff");

    const membership = await prisma.membership.findFirst({
      where: {
        id: membershipId,
        workspaceId: room.event.workspaceId,
      },
      select: { id: true },
    });
    if (!membership) return badRequest("Membership not found in event workspace");

    const eventAssignment = await prisma.eventAssignment.findFirst({
      where: { eventId, membershipId },
      select: { id: true },
    });
    if (!eventAssignment) return badRequest("Membership is not assigned to this event");

    const assignment = await prisma.eventRoomAssignment.create({
      data: {
        roomId,
        membershipId,
        assignedBy: userId,
      },
      include: {
        membership: { include: { workspaceRole: true } },
      },
    });

    return { statusCode: 201, body: JSON.stringify({ assignment }) };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") return forbidden("Not a member of this workspace");
      if (error.message === "FORBIDDEN") return forbidden("Insufficient permissions");
      if (error.message.includes("Unique constraint failed")) {
        return badRequest("Membership already assigned to this room");
      }
    }
    console.error("Failed to create room assignment:", error);
    return serverError("Failed to create room assignment");
  }
};
