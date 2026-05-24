import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { EventInviteStatus } from "../../lib/prismaClient";

import { prisma } from "../../lib/prisma";
import {
  badRequest,
  forbidden,
  notFound,
  serverError,
} from "../../lib/responses";
import { authorize } from "../../lib/authorization";
import {
  eventAssignmentToApi,
  eventInviteToApi,
} from "../../lib/mappers/roster";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const eventId = event.pathParameters?.eventId;

    if (!eventId) {
      return badRequest("Missing event id");
    }

    const dbEvent = await prisma.event.findUnique({
      where: { id: eventId },
      include: { workspace: true },
    });

    if (!dbEvent) {
      return notFound("Event not found");
    }

    const workspaceId = dbEvent.workspace.id;

    await authorize(userId, workspaceId, "event:viewRoster");

    const eventAssignments = await prisma.eventAssignment.findMany({
      where: { eventId },
      include: {
        membership: true,
        workspaceRole: true,
      },
    });

    const eventInvites = await prisma.eventInvite.findMany({
      where: {
        eventId,
        status: EventInviteStatus.PENDING,
      },
      include: {
        membership: true,
        invite: true,
        workspaceRole: true,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        assignments: eventAssignments.map(eventAssignmentToApi),
        pendingInvites: eventInvites.map(eventInviteToApi),
      }),
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
    console.error("Failed to list event roster:", error);
    return serverError("Failed to list event roster");
  }
};
