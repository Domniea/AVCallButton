import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { EventInviteStatus, InviteStatus } from "@prisma/client";

import { prisma } from "../lib/prisma";
import { authorize } from "../lib/authorization";
import { badRequest, notFound, forbidden, serverError } from "../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const workspaceId = event.pathParameters?.workspaceId;
    const inviteId = event.pathParameters?.inviteId;
    if (!workspaceId) return badRequest("Missing workspace ID");
    if (!inviteId) return badRequest("Missing invite ID");

    const invite = await prisma.invite.findUnique({
      where: { id: inviteId },
    });
    if (!invite) return notFound("Invite not found");

    if (invite.workspaceId !== workspaceId) {
      return notFound("Invite not found");
    }

    if (invite.status !== InviteStatus.PENDING) {
      return badRequest("Only pending invites can be revoked");
    }

    await authorize(userId, workspaceId, "workspace:deleteInvite");

    await prisma.$transaction(async (tx) => {
      await tx.eventInvite.updateMany({
        where: {
          inviteId,
          status: EventInviteStatus.PENDING,
        },
        data: { status: EventInviteStatus.REJECTED },
      });

      await tx.invite.update({
        where: { id: inviteId },
        data: { status: InviteStatus.CANCELED },
      });
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Invite revoked",
        id: inviteId,
        status: InviteStatus.CANCELED,
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
    console.error("Failed to revoke invite:", error);
    return serverError("Failed to revoke invite");
  }
};
