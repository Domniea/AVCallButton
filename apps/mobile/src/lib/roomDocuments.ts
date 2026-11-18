import { Platform } from "react-native";
import * as Device from "expo-device";
import * as DocumentPicker from "expo-document-picker";
import { Directory, File, Paths } from "expo-file-system";
import * as FileSystem from "expo-file-system/legacy";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";

import {
  getRoomFileDownloadUrl,
  uploadRoomDocument,
  type StoredFile,
} from "@av/store";

export type RoomDocumentSource = "camera" | "library" | "files";

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
  heic: "image/heic",
  heif: "image/heif",
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

function stampName(prefix: string, ext: string) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}-${stamp}.${ext}`;
}

function extFromMime(mime: string | null | undefined, fallback = "jpg") {
  if (!mime) return fallback;
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("heic")) return "heic";
  if (mime.includes("heif")) return "heif";
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  return fallback;
}

type PickedLocalFile = {
  uri: string;
  originalName: string;
  contentType: string;
  sizeBytes: number | null;
};

type CachedRoomDoc = {
  fileId: string;
  originalName: string;
  contentType: string;
  local: File;
};

async function resolveSizeBytes(
  uri: string,
  reported: number | null | undefined,
): Promise<number> {
  if (typeof reported === "number" && reported > 0) return reported;
  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists && typeof info.size === "number" && info.size > 0) {
    return info.size;
  }
  throw new Error("Could not read file size");
}

async function uploadLocalFile(
  token: string,
  eventId: string,
  roomId: string,
  picked: PickedLocalFile,
): Promise<StoredFile> {
  const sizeBytes = await resolveSizeBytes(picked.uri, picked.sizeBytes);
  const contentType = resolveContentType(picked.originalName, picked.contentType);

  const fileRes = await fetch(picked.uri);
  if (!fileRes.ok) {
    throw new Error("Could not read selected file");
  }
  const body = await fileRes.blob();

  return uploadRoomDocument(
    token,
    eventId,
    roomId,
    { originalName: picked.originalName, contentType, sizeBytes },
    body,
  );
}

async function pickFromFiles(): Promise<PickedLocalFile | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [...PICKER_TYPES],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    originalName: asset.name?.trim() || "document",
    contentType: asset.mimeType ?? "application/octet-stream",
    sizeBytes:
      typeof asset.size === "number" && asset.size > 0 ? asset.size : null,
  };
}

async function pickFromImage(
  source: "camera" | "library",
): Promise<PickedLocalFile | null> {
  if (source === "camera") {
    if (!Device.isDevice) {
      throw new Error(
        "Camera isn’t available in the simulator. Use Photo library, Browse files, or a physical device.",
      );
    }
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Camera permission is required to take a photo");
    }
  } else {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Photo library permission is required");
    }
  }

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          quality: 0.9,
          exif: false,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.9,
          exif: false,
          allowsMultipleSelection: false,
        });

  if (result.canceled || !result.assets?.[0]) return null;

  const asset = result.assets[0];
  const contentType = asset.mimeType ?? "image/jpeg";
  const originalName =
    asset.fileName?.trim() ||
    stampName(source === "camera" ? "photo" : "image", extFromMime(contentType));

  return {
    uri: asset.uri,
    originalName,
    contentType,
    sizeBytes:
      typeof asset.fileSize === "number" && asset.fileSize > 0
        ? asset.fileSize
        : null,
  };
}

/**
 * Pick from camera, photo library, or files, then upload via shared store helper.
 * Returns null if the user cancels.
 */
export async function pickAndUploadRoomDocument(
  token: string,
  eventId: string,
  roomId: string,
  source: RoomDocumentSource = "files",
): Promise<StoredFile | null> {
  const picked =
    source === "files" ? await pickFromFiles() : await pickFromImage(source);
  if (!picked) return null;
  return uploadLocalFile(token, eventId, roomId, picked);
}

function roomDocsCacheDir(): Directory {
  const dir = new Directory(Paths.cache, "room-docs");
  dir.create({ intermediates: true, idempotent: true });
  return dir;
}

function packetCandidates(
  selectedFileId: string,
  packet: StoredFile[],
): StoredFile[] {
  const ready = packet.filter((file) => file.status === "READY");
  if (ready.some((file) => file.id === selectedFileId)) return ready;
  const selected = packet.find((file) => file.id === selectedFileId);
  return selected ? [selected, ...ready] : ready;
}

async function downloadCachedRoomDoc(
  token: string,
  eventId: string,
  roomId: string,
  file: StoredFile,
): Promise<CachedRoomDoc> {
  const downloaded = await getRoomFileDownloadUrl(
    token,
    eventId,
    roomId,
    file.id,
  );
  const originalName = downloaded.originalName || file.originalName;
  const contentType = resolveContentType(
    originalName,
    downloaded.contentType || file.contentType,
  );
  const dest = new File(
    roomDocsCacheDir(),
    `${file.id}-${safeCacheName(originalName)}`,
  );
  const local = await File.downloadFileAsync(downloaded.downloadUrl, dest, {
    idempotent: true,
  });
  return { fileId: file.id, originalName, contentType, local };
}

async function previewSingle(doc: CachedRoomDoc): Promise<void> {
  const canPreview = await doc.local.canPreview({ mimeType: doc.contentType });
  if (!canPreview) {
    throw new Error("This file can’t be previewed on this device");
  }
  await doc.local.preview({
    title: doc.originalName,
    mimeType: doc.contentType,
  });
}

/**
 * Download room docs to cache and open the native in-app preview.
 * On iOS, opens the full packet in Quick Look starting at the selected file.
 * On Android, opens the selected file only (platform limit).
 */
export async function previewRoomDocument(
  token: string,
  eventId: string,
  roomId: string,
  selectedFileId: string,
  packet: StoredFile[] = [],
): Promise<void> {
  const candidates = packetCandidates(selectedFileId, packet);
  if (candidates.length === 0) {
    throw new Error("No documents available to preview");
  }

  const selected =
    candidates.find((file) => file.id === selectedFileId) ?? candidates[0];
  if (!selected) {
    throw new Error("Selected document was not found");
  }

  // Prefer opening the selected file quickly, then pull the rest for the packet.
  const selectedCached = await downloadCachedRoomDoc(
    token,
    eventId,
    roomId,
    selected,
  );

  const others = candidates.filter((file) => file.id !== selected.id);
  const otherResults = await Promise.allSettled(
    others.map((file) => downloadCachedRoomDoc(token, eventId, roomId, file)),
  );
  const otherById = new Map<string, CachedRoomDoc>();
  others.forEach((file, index) => {
    const result = otherResults[index];
    if (result?.status === "fulfilled") otherById.set(file.id, result.value);
  });

  const packetDocs: CachedRoomDoc[] = [];
  for (const file of candidates) {
    if (file.id === selected.id) {
      packetDocs.push(selectedCached);
      continue;
    }
    const cached = otherById.get(file.id);
    if (cached) packetDocs.push(cached);
  }

  const previewable: CachedRoomDoc[] = [];
  for (const doc of packetDocs) {
    try {
      if (await doc.local.canPreview({ mimeType: doc.contentType })) {
        previewable.push(doc);
      }
    } catch {
      // Skip files the platform cannot inspect.
    }
  }

  const initialIndex = previewable.findIndex(
    (doc) => doc.fileId === selected.id,
  );
  if (initialIndex < 0) {
    throw new Error("This file can’t be previewed on this device");
  }

  const canUsePacket =
    Platform.OS === "ios" &&
    previewable.length > 1 &&
    (await File.canPreview(previewable.map((doc) => doc.local)));

  if (canUsePacket) {
    await File.preview(
      previewable.map((doc) => doc.local),
      { initialIndex },
    );
    return;
  }

  await previewSingle(previewable[initialIndex]!);
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
