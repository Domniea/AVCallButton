import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { prisma } from "../../lib/prisma";
import { badRequest, notFound, serverError } from "../../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;

    const deviceTokenId = event.pathParameters?.deviceTokenId?.trim();
    if (!deviceTokenId) return badRequest("Missing device token id");

    const existing = await prisma.deviceToken.findFirst({
      where: { id: deviceTokenId, userId },
      select: { id: true },
    });
    if (!existing) return notFound("Device token not found");

    await prisma.deviceToken.delete({ where: { id: existing.id } });

    return {
      statusCode: 200,
      body: JSON.stringify({ deleted: true, deviceTokenId }),
    };
  } catch (error) {
    console.error("Failed to delete device token:", error);
    return serverError("Failed to delete device token");
  }
};
