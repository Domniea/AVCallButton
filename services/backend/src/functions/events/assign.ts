import { prisma } from "../lib/prisma";
import { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { badRequest, notFound } from "../lib/responses";
import { findWorkspaceMembershipByEmail, resolveInviteBranch } from "../lib/events/eventInvite";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const email = claims.email as string;

    const eventId = event.pathParameters?.eventId;

    if (!eventId) {
      return badRequest("Missing eventId");
    }

    const dbEvent = await prisma.event.findUnique({
      where: {
        id: eventId,
      },
      include: { workspace: true },
    });

    if (!dbEvent) {
      return notFound("Event not found");
    }
    const membership = await findWorkspaceMembershipByEmail(email, dbEvent.workspace.id);

    const inviteBranch = resolveInviteBranch(membership);


    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    }
  }
};