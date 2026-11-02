import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { authorize } from "../../../lib/authorization";
import { FileStatus } from "../../../lib/prismaClient";
import { prisma } from "../../../lib/prisma";
import {
  badRequest,
  forbidden,
  notFound,
  serverError,
} from "../../../lib/responses";
import {
  bucketNameForEnum,
  DOWNLOAD_URL_EXPIRES_IN_SECONDS,
  presignGetObject,
} from "../../../lib/s3";

export const handler: APIGatewayProxyHandlerV2WithJWTAuthorizer = async (
  event,
) => {
  try {
    const claims = event.requestContext.authorizer.jwt.claims;
    const userId = claims.sub as string;
    const eventId = event.pathParameters?.eventId;
    const roomId = event.pathParameters?.roomId;
    const fileId = event.pathParameters?.fileId;
    if (!eventId) return badRequest("Missing event id");
    if (!roomId) return badRequest("Missing room id");
    if (!fileId) return badRequest("Missing file id");

    const file = await prisma.file.findFirst({
      where: { id: fileId, eventId, roomId },
    });
    if (!file) return notFound("File not found");
    await authorize(userId, file.workspaceId, "event:view");

    if (file.status !== FileStatus.READY) {
      return badRequest("File is not ready");
    }

    const downloadUrl = await presignGetObject({
      bucket: bucketNameForEnum(file.bucket),
      key: file.key,
      contentType: file.contentType,
      filename: file.originalName,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        downloadUrl,
        expiresIn: DOWNLOAD_URL_EXPIRES_IN_SECONDS,
        originalName: file.originalName,
        contentType: file.contentType,
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
    console.error("Failed to get room file download URL:", error);
    return serverError("Failed to get room file download URL");
  }
};
