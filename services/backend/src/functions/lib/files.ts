export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/zip",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

export function isAllowedContentType(value: string): boolean {
  return ALLOWED_CONTENT_TYPES.has(value);
}

export function parseSizeBytes(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < 1 || value > MAX_UPLOAD_BYTES) return null;
  return value;
}

/** Basename only; strip path and unsafe characters. */
export function sanitizeOriginalName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const base = value.replace(/\\/g, "/").split("/").pop()?.trim() ?? "";
  if (!base) return null;
  const cleaned = base.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 180);
  if (!cleaned || cleaned === "." || cleaned === "..") return null;
  return cleaned;
}

export function roomFileKey(params: {
  workspaceId: string;
  eventId: string;
  roomId: string;
  fileId: string;
  originalName: string;
}): string {
  return `workspaces/${params.workspaceId}/events/${params.eventId}/rooms/${params.roomId}/${params.fileId}/${params.originalName}`;
}
