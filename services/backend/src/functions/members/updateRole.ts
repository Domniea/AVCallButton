import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";
import { prisma } from "../lib/prisma";
import { authorize } from "../lib/authorization";
import { roleRank, Role } from "../lib/permissions";
import { badRequest, notFound, forbidden, serverError } from "../lib/responses";

const VALID_ROLES: Role[] = ["owner", "showLead", "leadTech", "tech"];

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const workspaceId = event.pathParameters?.id;
    const memberId = event.pathParameters?.memberId;
    if (!workspaceId || !memberId)
      return badRequest("Missing workspaceId or memberId");

    const callerMembership = await authorize(
      userId,
      workspaceId,
      "workspace:changeRole",
    );

    if (!event.body) return badRequest("Missing request body");
    const { role } = JSON.parse(event.body);

    if (!role || !VALID_ROLES.includes(role)) return badRequest("Invalid role");

    const target = await prisma.membership.findUnique({
      where: { id: memberId },
    });
    if (!target || target.workspaceId !== workspaceId)
      return notFound("Member not found");

    if (target.userId === userId)
      return forbidden("Cannot change your own role");

    const callerRank = roleRank[callerMembership.role as Role];
    const newRank = roleRank[role as Role];
    if (newRank > callerRank)
      return forbidden("Cannot promote above your own rank");

    const updated = await prisma.membership.update({
      where: { id: memberId },
      data: { role },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ member: updated }),
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED")
        return forbidden("Not a member of this workspace");
      if (error.message === "FORBIDDEN")
        return forbidden("Insufficient permissions");
    }
    console.error("Failed to update role:", error);
    return serverError("Failed to update role");
  }
};
