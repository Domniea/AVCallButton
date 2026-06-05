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
    const membershipId = event.pathParameters?.membershipId;
    if (!eventId) return badRequest("Missing event id");
    if (!zoneId) return badRequest("Missing zone id");
    if (!membershipId) return badRequest("Missing membership id");

    const zone = await prisma.eventZone.findFirst({
      where: { id: zoneId, eventId },
      include: { event: { select: { workspaceId: true } } },
    });
    if (!zone) return notFound("Zone not found");

    await authorize(userId, zone.event.workspaceId, "event:assignStaff");

    const existing = await prisma.eventZoneCoverage.findFirst({
      where: { zoneId, membershipId },
      select: { id: true },
    });
    if (!existing) return notFound("Zone coverage not found");

    await prisma.eventZoneCoverage.delete({ where: { id: existing.id } });
    return {
      statusCode: 200,
      body: JSON.stringify({ deleted: true, zoneId, membershipId }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") return forbidden("Not a member of this workspace");
      if (error.message === "FORBIDDEN") return forbidden("Insufficient permissions");
    }
    console.error("Failed to delete zone coverage:", error);
    return serverError("Failed to delete zone coverage");
  }
};
