import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { EventInviteStatus } from "../../lib/prismaClient";

import { prisma } from "../../lib/prisma";
import { authorize } from "../../lib/authorization";
import { badRequest, forbidden, notFound, serverError } from "../../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const eventId = event.pathParameters?.eventId;
    const eventInviteId = event.pathParameters?.eventInviteId;

    if (!eventId) {
      return badRequest("Missing event id");
    }
    if (!eventInviteId) {
      return badRequest("Missing event invite id");
    }

    const dbEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { workspaceId: true },
    });

    if (!dbEvent) {
      return notFound("Event not found");
    }

    await authorize(userId, dbEvent.workspaceId, "event:assignStaff");

    const eventInvite = await prisma.eventInvite.findFirst({
      where: {
        id: eventInviteId,
        eventId,
      },
    });

    if (!eventInvite) {
      return notFound("Pending roster invite not found for this event");
    }

    if (eventInvite.status !== EventInviteStatus.PENDING) {
      return badRequest("Only pending roster invites can be removed");
    }

    await prisma.eventInvite.delete({
      where: { id: eventInvite.id },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ deleted: true, id: eventInvite.id }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") {
        return forbidden("Not a member of this workspace");
      }
      if (error.message === "FORBIDDEN") {
        return forbidden("Insufficient permissions");
      }
    }
    console.error("Failed to delete pending roster invite:", error);
    return serverError("Failed to delete pending roster invite");
  }
};
