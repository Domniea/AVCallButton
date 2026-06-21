import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { assertWorkspaceMembership } from "../../../lib/authorization";
import {
  formatAssignmentSummary,
  formatEventMeta,
} from "../../../lib/mappers/me";
import { countMyCoverageSummary } from "../../../lib/resolvers/coverage/resolveMyCoverage";
import { prisma } from "../../../lib/prisma";
import { badRequest, forbidden, serverError } from "../../../lib/responses";

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

    const membership = await assertWorkspaceMembership(userId, workspaceId);

    const assignments = await prisma.eventAssignment.findMany({
      where: {
        membershipId: membership.id,
        event: { workspaceId },
      },
      include: {
        workspaceRole: true,
        event: true,
      },
      orderBy: { event: { createdAt: "desc" } },
    });

    const events = await Promise.all(
      assignments.map(async (assignment) => {
        const [zoneCoverageRows, roomCoverageRows, eventRooms] =
          await Promise.all([
            prisma.eventZoneCoverage.findMany({
              where: {
                membershipId: membership.id,
                zone: { eventId: assignment.eventId },
              },
              include: { zone: true },
            }),
            prisma.eventRoomCoverage.findMany({
              where: {
                membershipId: membership.id,
                room: { eventId: assignment.eventId },
              },
              include: { room: { include: { zone: true } } },
            }),
            prisma.eventRoom.findMany({
              where: { eventId: assignment.eventId },
            }),
          ]);

        const coverageSummary = countMyCoverageSummary({
          zoneCoverageRows,
          roomCoverageRows,
          eventRooms,
        });

        return {
          event: formatEventMeta(assignment.event),
          assignment: formatAssignmentSummary(assignment),
          coverageSummary,
        };
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ events }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") {
        return forbidden("Not a member of this workspace");
      }
    }
    console.error("Failed to list my workspace events:", error);
    return serverError("Failed to list my workspace events");
  }
};
