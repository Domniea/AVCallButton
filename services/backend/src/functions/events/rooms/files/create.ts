import { randomUUID } from "node:crypto";
import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { authorize } from "../../../lib/authorization";
import {
  isAllowedContentType,
  parseSizeBytes,
  roomFileKey,
  sanitizeOriginalName,
} from "../../../lib/files";
import { fileToApi } from "../../../lib/mappers/file";
import { FileBucket } from "../../../lib/prismaClient";
import { prisma } from "../../../lib/prisma";
import {
  badRequest,
  forbidden,
  notFound,
  serverError,
} from "../../../lib/responses";
import {
  presignPutObject,
  uploadsBucketName,
  UPLOAD_URL_EXPIRES_IN_SECONDS,
} from "../../../lib/s3";

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
    if (!event.body) return badRequest("Missing request body");

    let requestBody: unknown;
    try {
      requestBody = JSON.parse(event.body);
    } catch {
      return badRequest("Invalid JSON");
    }
    if (typeof requestBody !== "object" || requestBody === null) {
      return badRequest("Invalid body");
    }
    const body = requestBody as Record<string, unknown>;

    const originalName = sanitizeOriginalName(body.originalName);
    if (!originalName) return badRequest("Invalid originalName");

    const contentType =
      typeof body.contentType === "string" ? body.contentType.trim() : "";
    if (!isAllowedContentType(contentType)) {
      return badRequest("Unsupported contentType");
    }

    const sizeBytes = parseSizeBytes(body.sizeBytes);
    if (sizeBytes == null) return badRequest("Invalid sizeBytes");

    const room = await prisma.eventRoom.findFirst({
      where: { id: roomId, eventId },
      include: { event: { select: { workspaceId: true } } },
    });
    if (!room) return notFound("Room not found");
    await authorize(userId, room.event.workspaceId, "event:update");

    const fileId = randomUUID();
    const key = roomFileKey({
      workspaceId: room.event.workspaceId,
      eventId,
      roomId,
      fileId,
      originalName,
    });
    const bucket = uploadsBucketName();

    const file = await prisma.file.create({
      data: {
        id: fileId,
        workspaceId: room.event.workspaceId,
        eventId,
        roomId,
        bucket: FileBucket.UPLOADS,
        key,
        originalName,
        contentType,
        sizeBytes,
        uploadedBy: userId,
      },
    });

    const uploadUrl = await presignPutObject({
      bucket,
      key,
      contentType,
    });

    return {
      statusCode: 201,
      body: JSON.stringify({
        file: fileToApi(file),
        uploadUrl,
        expiresIn: UPLOAD_URL_EXPIRES_IN_SECONDS,
        headers: { "Content-Type": contentType },
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
    console.error("Failed to create room file upload:", error);
    return serverError("Failed to create room file upload");
  }
};
