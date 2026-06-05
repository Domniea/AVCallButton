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
    const zoneId = event.pathParameters?.zoneId;
    if (!eventId) return badRequest("Missing event id");
    if (!zoneId) return badRequest("Missing zone id");
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

    const zone = await prisma.eventZone.findFirst({
      where: { id: zoneId, eventId },
      include: { event: { select: { workspaceId: true } } },
    });
    if (!zone) return notFound("Zone not found");

    await authorize(userId, zone.event.workspaceId, "event:assignStaff");

    const membership = await prisma.membership.findFirst({
      where: {
        id: membershipId,
        workspaceId: zone.event.workspaceId,
      },
      select: { id: true },
    });
    if (!membership) return badRequest("Membership not found in event workspace");

    const eventAssignment = await prisma.eventAssignment.findFirst({
      where: { eventId, membershipId },
      select: { id: true },
    });
    if (!eventAssignment) return badRequest("Membership is not assigned to this event");

    const coverage = await prisma.eventZoneCoverage.create({
      data: {
        zoneId,
        membershipId,
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
        return badRequest("Membership already allocated to this zone");
      }
    }
    console.error("Failed to create zone coverage:", error);
    return serverError("Failed to create zone coverage");
  }
};
