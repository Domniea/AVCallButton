import type { File } from "@prisma/client";

export function fileToApi(file: File) {
  return {
    id: file.id,
    workspaceId: file.workspaceId,
    eventId: file.eventId,
    roomId: file.roomId,
    bucket: file.bucket,
    originalName: file.originalName,
    contentType: file.contentType,
    sizeBytes: file.sizeBytes,
    status: file.status,
    uploadedBy: file.uploadedBy,
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
  };
}
