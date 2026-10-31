import { Linking } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import {
  getRoomFileDownloadUrl,
  uploadRoomDocument,
  type StoredFile,
} from "@av/store";

const PICKER_TYPES = [
  "application/pdf",
  "image/*",
  "text/plain",
  "application/zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

const EXT_TO_MIME: Record<string, string> = {
  pdf: "application/pdf",
  txt: "text/plain",
  zip: "application/zip",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

export function formatFileSize(bytes: number | null): string {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mimeFromName(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_MIME[ext] ?? null;
}

function resolveContentType(name: string, mimeType: string | null | undefined) {
  const trimmed = mimeType?.trim();
  if (trimmed && trimmed !== "application/octet-stream") return trimmed;
  return mimeFromName(name) ?? "application/octet-stream";
}

function safeCacheName(originalName: string): string {
  const cleaned = originalName.replace(/[^\w.\- ()[\]]+/g, "_").slice(0, 120);
  return cleaned || "document";
}

/** System file picker → S3 upload via shared store helper. Returns null if cancelled. */
export async function pickAndUploadRoomDocument(
  token: string,
  eventId: string,
  roomId: string,
): Promise<StoredFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [...PICKER_TYPES],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const originalName = asset.name?.trim() || "document";
  const contentType = resolveContentType(originalName, asset.mimeType);
  const sizeBytes =
    typeof asset.size === "number" && asset.size > 0 ? asset.size : null;

  if (sizeBytes == null) {
    throw new Error("Could not read file size");
  }

  const fileRes = await fetch(asset.uri);
  if (!fileRes.ok) {
    throw new Error("Could not read selected file");
  }
  const body = await fileRes.blob();

  return uploadRoomDocument(
    token,
    eventId,
    roomId,
    { originalName, contentType, sizeBytes },
    body,
  );
}

/** Open the signed download URL in the system browser / Quick Look. */
export async function previewRoomDocument(
  token: string,
  eventId: string,
  roomId: string,
  fileId: string,
): Promise<void> {
  const { downloadUrl } = await getRoomFileDownloadUrl(
    token,
    eventId,
    roomId,
    fileId,
  );
  const canOpen = await Linking.canOpenURL(downloadUrl);
  if (!canOpen) {
    throw new Error("Cannot open this file on this device");
  }
  await Linking.openURL(downloadUrl);
}

/** Download to cache and open the share sheet (Save to Files / AirDrop / etc.). */
export async function shareRoomDocument(
  token: string,
  eventId: string,
  roomId: string,
  fileId: string,
  originalName: string,
  contentType: string,
): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error("Sharing is not available on this device");
  }

  const { downloadUrl } = await getRoomFileDownloadUrl(
    token,
    eventId,
    roomId,
    fileId,
  );

  const cacheRoot = FileSystem.cacheDirectory;
  if (!cacheRoot) {
    throw new Error("Cache directory is unavailable");
  }

  const dest = `${cacheRoot}room-doc-${fileId}-${safeCacheName(originalName)}`;
  const downloaded = await FileSystem.downloadAsync(downloadUrl, dest);
  await Sharing.shareAsync(downloaded.uri, {
    mimeType: contentType || undefined,
    dialogTitle: originalName,
    UTI: contentType || undefined,
  });
}
