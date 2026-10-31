import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { authorize } from "../../../lib/authorization";
import { fileToApi } from "../../../lib/mappers/file";
import { FileStatus } from "../../../lib/prismaClient";
import { prisma } from "../../../lib/prisma";
import {
  badRequest,
  forbidden,
  notFound,
  serverError,
} from "../../../lib/responses";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const eventId = event.pathParameters?.eventId;
    const roomId = event.pathParameters?.roomId;
    if (!eventId) return badRequest("Missing event id");
    if (!roomId) return badRequest("Missing room id");

    const room = await prisma.eventRoom.findFirst({
      where: { id: roomId, eventId },
      include: { event: { select: { workspaceId: true } } },
    });
    if (!room) return notFound("Room not found");
    await authorize(userId, room.event.workspaceId, "event:view");

    const files = await prisma.file.findMany({
      where: { roomId, eventId, status: FileStatus.READY },
      orderBy: { createdAt: "desc" },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ files: files.map(fileToApi) }),
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
    console.error("Failed to list room files:", error);
    return serverError("Failed to list room files");
  }
};
