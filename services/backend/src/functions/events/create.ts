import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { prisma } from "../lib/prisma";
import { EventStatus } from "../lib/prismaClient";
import { authorize } from "../lib/authorization";
import { badRequest, forbidden, serverError } from "../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const workspaceId = event.pathParameters?.workspaceId;
    if (!workspaceId) {
      return badRequest("Missing workspaceId");
    }

    const callerMembership = await authorize(
      userId,
      workspaceId,
      "event:create",
    );

    if (!event.body) {
      return badRequest("Missing request body");
    }

    const { name, location, venue, startTime, endTime } = JSON.parse(
      event.body,
    );

    if (
      !name ||
      typeof name !== "string" ||
      name.trim().length < 2 ||
      name.trim().length > 100
    ) {
      return badRequest("Invalid event name");
    }

    const created = await prisma.$transaction(async (tx) => {
      const newEvent = await tx.event.create({
        data: {
          name: name.trim(),
          status: EventStatus.DRAFT,
          location: location ?? null,
          venue: venue ?? null,
          startTime: startTime ? new Date(startTime) : null,
          endTime: endTime ? new Date(endTime) : null,
          workspaceId,
        },
      });

      const rank = callerMembership.workspaceRole.rank;
      await tx.eventAssignment.create({
        data: {
          eventId: newEvent.id,
          membershipId: callerMembership.id,
          workspaceRoleId: callerMembership.workspaceRoleId,
          eventRank: rank,
          assignedBy: userId,
        },
      });

      return newEvent;
    });

    return {
      statusCode: 201,
      body: JSON.stringify({ event: created }),
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
    console.error("Failed to create event:", error);
    return serverError("Failed to create event");
  }
};
