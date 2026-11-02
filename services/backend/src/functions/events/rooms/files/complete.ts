import type { APIGatewayProxyHandlerV2WithJWTAuthorizer } from "aws-lambda";

import { authorize } from "../../../lib/authorization";
import { fileToApi } from "../../../lib/mappers/file";
import { FileBucket, FileStatus } from "../../../lib/prismaClient";
import { prisma } from "../../../lib/prisma";
import {
  badRequest,
  forbidden,
  notFound,
  serverError,
} from "../../../lib/responses";
import { objectExists, uploadsBucketName } from "../../../lib/s3";

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
    await authorize(userId, file.workspaceId, "event:update");

    if (file.bucket !== FileBucket.UPLOADS) {
      return badRequest("File is not an upload");
    }
    if (file.status === FileStatus.READY) {
      return { statusCode: 200, body: JSON.stringify({ file: fileToApi(file) }) };
    }

    const exists = await objectExists({
      bucket: uploadsBucketName(),
      key: file.key,
    });
    if (!exists) return badRequest("Upload not found in storage");

    const updated = await prisma.file.update({
      where: { id: file.id },
      data: { status: FileStatus.READY },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ file: fileToApi(updated) }),
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
    console.error("Failed to complete room file upload:", error);
    return serverError("Failed to complete room file upload");
  }
};
