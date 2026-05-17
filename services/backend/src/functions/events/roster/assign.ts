import type { EventAssignment, EventInvite, Invite } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  badRequest,
  forbidden,
  notFound,
  serverError,
} from "../../lib/responses";
import { isValidEmailInput, normalizeEmail } from "../../lib/email";
import {
  assertNoDuplicateAssignmentOrPendingInvite,
  findPendingWorkspaceInviteByEmail,
  findWorkspaceMembershipByEmail,
  queWorkspaceInviteAndPendingEventInviteAssignment,
  reactivateMemberAndSetEventStaffAssignment,
  resolveInviteBranch,
  setEventStaffAssignment,
} from "../../lib/events/eventInvite";
import { authorize } from "../../lib/authorization";
import { parseWorkspaceRoleRank } from "../../lib/permissions";

function bodyHasWorkspaceRoleRank(body: Record<string, unknown>): boolean {
  return (
    body.workspaceRoleRank !== undefined && body.workspaceRoleRank !== null
  );
}

/** Domain errors from `eventInvite` → HTTP 400 (must match `throw new Error(...)` text). */
const ASSIGN_BAD_REQUEST_MESSAGES = new Set([
  "Event already assigned",
  "User already invited",
  "Invalid event rank",
  "Event rank cannot be greater than the workspace role rank",
  "Membership not found",
  "Workspace role not found for membership",
  "Membership is not inactive",
  "Workspace role not found for this rank",
  "Invalid email",
  "Pending event invite already exists for this event and invite",
]);

function inviteToAssignResponse(invite: Invite) {
  return {
    id: invite.id,
    email: invite.email,
    workspaceId: invite.workspaceId,
    workspaceRoleId: invite.workspaceRoleId,
    status: invite.status,
    expiresAt: invite.expiresAt.toISOString(),
    createdAt: invite.createdAt.toISOString(),
  };
}

function eventInviteToAssignResponse(eventInvite: EventInvite) {
  return {
    id: eventInvite.id,
    eventId: eventInvite.eventId,
    inviteId: eventInvite.inviteId,
    workspaceRoleId: eventInvite.workspaceRoleId,
    eventRank: eventInvite.eventRank,
    status: eventInvite.status,
    assignedBy: eventInvite.assignedBy,
  };
}

function eventAssignmentToAssignResponse(row: EventAssignment) {
  return {
    id: row.id,
    eventId: row.eventId,
    membershipId: row.membershipId,
    workspaceRoleId: row.workspaceRoleId,
    eventRank: row.eventRank,
    assignedBy: row.assignedBy,
    createdAt: row.createdAt.toISOString(),
  };
}

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    if (!isValidEmailInput(claims.email)) {
      return badRequest("Invalid or missing inviter email on token");
    }
    const inviterEmail = normalizeEmail(claims.email);

    const eventId = event.pathParameters?.eventId;

    if (!eventId) {
      return badRequest("Missing eventId");
    }

    if (!event.body) {
      return badRequest("Missing request body");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(event.body);
    } catch {
      return badRequest("Invalid JSON");
    }

    if (typeof parsed !== "object" || parsed === null) {
      return badRequest("Invalid body");
    }

    const body = parsed as Record<string, unknown>;
    const email = body.email;

    const eventRank = parseWorkspaceRoleRank(body.eventRank);
    if (eventRank === null) {
      return badRequest("Invalid eventRank");
    }

    if (!isValidEmailInput(email)) {
      return badRequest("Invalid email");
    }
    const normalizedEmail = normalizeEmail(email);

    const dbEvent = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: { workspace: true },
    });

    if (!dbEvent) {
      return notFound("Event not found");
    }

    const workspaceId = dbEvent.workspace.id;

    await authorize(userId, workspaceId, "event:assignStaff");

    const membership = await findWorkspaceMembershipByEmail(
      normalizedEmail,
      workspaceId,
    );

    await assertNoDuplicateAssignmentOrPendingInvite({
      eventId,
      workspaceId,
      membership,
      email: normalizedEmail,
    });

    const inviteBranch = resolveInviteBranch(membership);

    switch (inviteBranch) {
      case "invite_to_workspace_and_assign": {
        const pendingInvite = await findPendingWorkspaceInviteByEmail(
          normalizedEmail,
          workspaceId,
        );

        let workspaceRoleRank: number;

        if (pendingInvite) {
          if (bodyHasWorkspaceRoleRank(body)) {
            return badRequest(
              "workspaceRoleRank must not be sent when a pending workspace invite already exists for this email",
            );
          }
          workspaceRoleRank = pendingInvite.workspaceRole.rank;
        } else {
          if (!bodyHasWorkspaceRoleRank(body)) {
            return badRequest(
              "workspaceRoleRank is required when the email is not in this workspace",
            );
          }
          const parsedWorkspaceRoleRank = parseWorkspaceRoleRank(
            body.workspaceRoleRank,
          );
          if (parsedWorkspaceRoleRank === null) {
            return badRequest("Invalid workspaceRoleRank");
          }
          workspaceRoleRank = parsedWorkspaceRoleRank;
        }

        const { invite, eventInvite } =
          await queWorkspaceInviteAndPendingEventInviteAssignment(
            userId,
            workspaceRoleRank,
            eventRank,
            workspaceId,
            eventId,
            normalizedEmail,
            inviterEmail,
          );
        return {
          statusCode: 202,
          body: JSON.stringify({
            status: "queued_workspace_and_event_invite",
            invite: inviteToAssignResponse(invite),
            eventInvite: eventInviteToAssignResponse(eventInvite),
          }),
        };
      }
      case "reactivate_then_assign": {
        if (bodyHasWorkspaceRoleRank(body)) {
          return badRequest(
            "workspaceRoleRank must not be sent for existing workspace members",
          );
        }
        const assignment = await reactivateMemberAndSetEventStaffAssignment(
          userId,
          eventId,
          membership,
          eventRank,
        );
        return {
          statusCode: 201,
          body: JSON.stringify({
            status: "reactivated_and_assigned",
            assignment: eventAssignmentToAssignResponse(assignment),
          }),
        };
      }
      case "assign_now": {
        if (bodyHasWorkspaceRoleRank(body)) {
          return badRequest(
            "workspaceRoleRank must not be sent for existing workspace members",
          );
        }
        const assignment = await setEventStaffAssignment(
          userId,
          eventId,
          membership,
          eventRank,
        );
        return {
          statusCode: 201,
          body: JSON.stringify({
            status: "assigned",
            assignment: eventAssignmentToAssignResponse(assignment),
          }),
        };
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") {
        return forbidden("Not a member of this workspace");
      }
      if (error.message === "FORBIDDEN") {
        return forbidden("Insufficient permissions");
      }
      if (ASSIGN_BAD_REQUEST_MESSAGES.has(error.message)) {
        return badRequest(error.message);
      }
    }
    console.error("assign staff failed:", error);
    return serverError("Internal server error");
  }
};
