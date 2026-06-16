import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { prisma } from "../../../lib/prisma";
import { authorize } from "../../../lib/authorization";
import { findEventRosterAssignment } from "../../../lib/events/eventRoster";
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

    const rosterEntry = await findEventRosterAssignment(eventId, membershipId);
    if (!rosterEntry) {
      return badRequest("Membership is not assigned to this event");
    }

    const coverage = await prisma.eventRoomCoverage.create({
      data: {
        roomId,
        membershipId,
        eventRank: rosterEntry.eventRank,
        assignedBy: userId,
      },
      include: {
        membership: { include: { workspaceRole: true } },
      },
    });

    return { statusCode: 201, body: JSON.stringify({ coverage }) };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") return forbidden("Not a member of this workspace");
      if (error.message === "FORBIDDEN") return forbidden("Insufficient permissions");
      if (error.message.includes("Unique constraint failed")) {
        return badRequest("Membership already allocated to this room");
      }
    }
    console.error("Failed to create room coverage:", error);
    return serverError("Failed to create room coverage");
  }
};
