import { getApiClient } from "./client";

export type FileBucket = "UPLOADS" | "GENERATED";
export type FileStatus = "PENDING" | "READY";

export type StoredFile = {
  id: string;
  workspaceId: string;
  eventId: string | null;
  roomId: string | null;
  bucket: FileBucket;
  originalName: string;
  contentType: string;
  sizeBytes: number | null;
  status: FileStatus;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type RequestRoomFileUploadInput = {
  originalName: string;
  contentType: string;
  sizeBytes: number;
};

export type RequestRoomFileUploadResponse = {
  file: StoredFile;
  uploadUrl: string;
  expiresIn: number;
  headers: { "Content-Type": string };
};

export type RoomFileDownloadResponse = {
  downloadUrl: string;
  expiresIn: number;
  originalName: string;
  contentType: string;
};

export async function listRoomFiles(
  token: string,
  eventId: string,
  roomId: string,
): Promise<{ files: StoredFile[] }> {
  const api = getApiClient();
  const res = await api.get<{ files: StoredFile[] }>(
    `/events/${eventId}/rooms/${roomId}/files`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function getRoomFileDownloadUrl(
  token: string,
  eventId: string,
  roomId: string,
  fileId: string,
): Promise<RoomFileDownloadResponse> {
  const api = getApiClient();
  const res = await api.get<RoomFileDownloadResponse>(
    `/events/${eventId}/rooms/${roomId}/files/${fileId}/download`,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function requestRoomFileUpload(
  token: string,
  eventId: string,
  roomId: string,
  data: RequestRoomFileUploadInput,
): Promise<RequestRoomFileUploadResponse> {
  const api = getApiClient();
  const res = await api.post<RequestRoomFileUploadResponse>(
    `/events/${eventId}/rooms/${roomId}/files`,
    data,
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

export async function completeRoomFileUpload(
  token: string,
  eventId: string,
  roomId: string,
  fileId: string,
): Promise<{ file: StoredFile }> {
  const api = getApiClient();
  const res = await api.post<{ file: StoredFile }>(
    `/events/${eventId}/rooms/${roomId}/files/${fileId}/complete`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
}

/** Body for the S3 PUT — web uses `Blob`/`File`; React Native can pass `Blob` or `ArrayBuffer`. */
export type RoomUploadBody = Blob | ArrayBuffer;

/** Create → PUT bytes to S3 → complete. */
export async function uploadRoomDocument(
  token: string,
  eventId: string,
  roomId: string,
  meta: RequestRoomFileUploadInput,
  body: RoomUploadBody,
): Promise<StoredFile> {
  const { file: pending, uploadUrl, headers } = await requestRoomFileUpload(
    token,
    eventId,
    roomId,
    meta,
  );

  const putRes = await fetch(uploadUrl, {
    method: "PUT",
    body,
    headers: { "Content-Type": headers["Content-Type"] },
  });
  if (!putRes.ok) {
    throw new Error("Failed to upload file to storage");
  }

  const { file: ready } = await completeRoomFileUpload(
    token,
    eventId,
    roomId,
    pending.id,
  );
  return ready;
}
