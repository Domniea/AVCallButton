import { prisma } from "../lib/prisma";
import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { badRequest, forbidden, notFound } from "../lib/responses";
import { isValidEmailInput, normalizeEmail } from "../lib/email";
import {
  assertNoDuplicateAssignmentOrPendingInvite,
  findWorkspaceMembershipByEmail,
  resolveInviteBranch,
} from "../lib/events/eventInvite";
import { authorize } from "../lib/authorization";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const eventId = event.pathParameters?.eventId;

    if (!eventId) {
      return badRequest("Missing eventId");
    }

    if (!event.body) {
      return badRequest("Missing request body");
    }

    const { email } = JSON.parse(event.body) as { email?: unknown };

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

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
