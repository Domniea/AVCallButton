import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import {
  EventInviteStatus,
  InviteStatus,
  MembershipStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "../lib/prisma";
import { badRequest, notFound, serverError } from "../lib/responses";
import { membershipAcceptToApi } from "../lib/mappers/member";
import { isValidEmailInput, normalizeEmail } from "../lib/email";
import { finalizePendingEventInvitesOnAccept } from "../lib/events/eventInvite";

const ACCEPT_BAD_REQUEST_MESSAGES = new Set([
  "Workspace role not found for membership",
  "Event rank must be at least 1",
  "Event rank cannot be greater than the workspace role rank",
]);

function prismaUniqueTarget(error: Prisma.PrismaClientKnownRequestError): string {
  const t = error.meta?.target;
  if (Array.isArray(t)) return t.join(",");
  if (typeof t === "string") return t;
  return "";
}

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    if (!isValidEmailInput(claims.email)) {
      return badRequest("Invalid email");
    }
    const normalizedEmail = normalizeEmail(claims.email);

    if (!event.body) return badRequest("Missing request body");

    const { token } = JSON.parse(event.body);
    if (!token) return badRequest("Missing token");

    const invite = await prisma.invite.findUnique({
      where: { token },
      include: { workspaceRole: true },
    });

    if (!invite) return notFound("Invite not found");

    if (normalizeEmail(invite.email) !== normalizedEmail) {
      return badRequest(
        `This invite was sent to ${invite.email}. Please log in with that account.`,
      );
    }

    if (invite.status !== InviteStatus.PENDING) {
      return badRequest("Invite has already been " + invite.status);
    }

    if (invite.expiresAt < new Date()) {
      return badRequest("Invite has expired");
    }

    const { workspaceRole } = invite;
    if (!workspaceRole) {
      return badRequest(
        "Invite is missing workspace role; ask for a new invite",
      );
    }

    if (workspaceRole.workspaceId !== invite.workspaceId) {
      return badRequest("Invite data is inconsistent; ask for a new invite");
    }

    const { membership, assignments, finalizedEventInviteIds } =
      await prisma.$transaction(async (tx) => {
        const pendingEventInvites = await tx.eventInvite.findMany({
          where: {
            inviteId: invite.id,
            status: EventInviteStatus.PENDING,
          },
        });

        const newMembership = await tx.membership.create({
          data: {
            userId,
            email: normalizedEmail,
            workspaceId: invite.workspaceId,
            workspaceRoleId: invite.workspaceRoleId,
            status: MembershipStatus.ACTIVE,
            type: invite.membershipType,
          },
        });

        const finalizeResult = await finalizePendingEventInvitesOnAccept(
          tx,
          invite.id,
          newMembership,
          pendingEventInvites,
        );

        await tx.invite.update({
          where: { id: invite.id },
          data: { status: InviteStatus.ACCEPTED },
        });

        return {
          membership: newMembership,
          assignments: finalizeResult.assignments,
          finalizedEventInviteIds: finalizeResult.finalizedEventInviteIds,
        };
      });

    return {
      statusCode: 200,
      body: JSON.stringify({
        membership: membershipAcceptToApi(membership, workspaceRole),
        assignments,
        finalizedEventInviteIds,
      }),
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const target = prismaUniqueTarget(error);
      if (target.includes("userId") && target.includes("workspaceId")) {
        return badRequest("You are already a member of this workspace");
      }
      if (target.includes("eventId") && target.includes("membershipId")) {
        return badRequest("Event already assigned");
      }
      return badRequest("A record with this information already exists");
    }
    if (
      error instanceof Error &&
      ACCEPT_BAD_REQUEST_MESSAGES.has(error.message)
    ) {
      return badRequest(error.message);
    }
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return badRequest("You are already a member of this workspace");
    }
    console.error("Failed to accept invite:", error);
    return serverError("Failed to accept invite");
  }
};
