import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { prisma } from "../../lib/prisma";
import { authorize } from "../../lib/authorization";
import { badRequest, forbidden, notFound, serverError } from "../../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const eventId = event.pathParameters?.eventId;
    if (!eventId) return badRequest("Missing event id");

    const dbEvent = await prisma.event.findUnique({
      where: { id: eventId },
      select: { workspaceId: true },
    });
    if (!dbEvent) return notFound("Event not found");

    await authorize(userId, dbEvent.workspaceId, "event:view");

    const rooms = await prisma.eventRoom.findMany({
      where: { eventId },
      include: { zone: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return { statusCode: 200, body: JSON.stringify({ rooms }) };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "NOT_AUTHORIZED") return forbidden("Not a member of this workspace");
      if (error.message === "FORBIDDEN") return forbidden("Insufficient permissions");
    }
    console.error("Failed to list rooms:", error);
    return serverError("Failed to list rooms");
  }
};
