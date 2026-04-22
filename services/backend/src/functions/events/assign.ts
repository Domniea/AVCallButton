import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { MembershipStatus } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { authorize } from "../lib/authorization";
import { badRequest, forbidden, notFound, serverError } from "../lib/responses";

/**
 * Assign an existing workspace member to an event by email.
 * Persists membership, source `workspaceRoleId`, and `eventRank` (equals role rank until event-specific tiers diverge).
 */
export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const callerId = claims.sub as string;

    const eventId = event.pathParameters?.eventId;
    if (!eventId) return badRequest("Missing eventId");

    if (!event.body) return badRequest("Missing request body");

    const { email } = JSON.parse(event.body) as { email?: unknown };

    const normalizedEmail =
      typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return badRequest("Invalid email");
    }

    const existingEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, workspaceId: true },
    });
    if (!existingEvent) return notFound("Event not found");

    const workspaceId = existingEvent.workspaceId;

    await authorize(callerId, workspaceId, "event:assignTech");

    const assigneeMembership = await prisma.membership.findFirst({
      where: {
        workspaceId,
        status: MembershipStatus.ACTIVE,
        email: { equals: normalizedEmail, mode: "insensitive" },
      },
      include: { workspaceRole: true },
    });

    if (!assigneeMembership) {
      return badRequest(
        "No active workspace member with that email. Invite them to the workspace first.",
      );
    }

    const rank = assigneeMembership.workspaceRole.rank;

    try {
      const assignment = await prisma.eventAssignment.create({
        data: {
          eventId,
          membershipId: assigneeMembership.id,
          workspaceRoleId: assigneeMembership.workspaceRoleId,
          eventRank: rank,
          assignedBy: callerId,
        },
        include: {
          workspaceRole: true,
          membership: true,
        },
      });

      let eventRoleName = assignment.workspaceRole.name;
      if (assignment.eventRank !== assignment.workspaceRole.rank) {
        const eventTier = await prisma.workspaceRole.findUnique({
          where: {
            workspaceId_rank: {
              workspaceId,
              rank: assignment.eventRank,
            },
          },
        });
        if (eventTier) eventRoleName = eventTier.name;
      }

      return {
        statusCode: 201,
        body: JSON.stringify({
          assignment: {
            id: assignment.id,
            eventId: assignment.eventId,
            membershipId: assignment.membershipId,
            userId: assignment.membership.userId,
            workspaceRoleId: assignment.workspaceRoleId,
            workspaceRoleName: assignment.workspaceRole.name,
            eventRank: assignment.eventRank,
            eventRoleName,
            assignedBy: assignment.assignedBy,
            createdAt: assignment.createdAt,
          },
        }),
      };
    } catch (err) {
      if (err instanceof Error && err.message.includes("Unique constraint")) {
        return badRequest("User is already assigned to this event");
      }
      throw err;
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") {
        return forbidden("Not a member of this workspace");
      }
      if (error.message === "FORBIDDEN") {
        return forbidden("Insufficient permissions");
      }
    }
    console.error("Failed to assign event member:", error);
    return serverError("Failed to assign event member");
  }
};
