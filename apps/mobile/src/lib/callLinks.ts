import Constants from "expo-constants";

/** Guest web base URL from app.config.ts `extra.APP_URL` (backed by EXPO_PUBLIC_APP_URL). */
function resolveGuestAppUrl(): string {
  const appUrl = Constants.expoConfig?.extra?.APP_URL;
  if (typeof appUrl === "string" && appUrl.trim().length > 0) {
    return appUrl.trim().replace(/\/$/, "");
  }

  const fromEnv = process.env.EXPO_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  throw new Error(
    "APP_URL is not configured. Set EXPO_PUBLIC_APP_URL or app.config.ts extra.APP_URL.",
  );
}

/** Public guest URL for a room's QR / call link. */
export function buildGuestCallUrl(callToken: string): string {
  return `${resolveGuestAppUrl()}/c/${encodeURIComponent(callToken)}`;
}

function sanitizeFilenamePart(value: string): string {
  return value
    .trim()
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function guestCallQrFilename(roomName: string): string {
  const slug = sanitizeFilenamePart(roomName) || "room";
  return `${slug}-call-qr.png`;
}

export function guestCallPdfFilename(roomName: string): string {
  return guestCallQrFilename(roomName).replace(/\.png$/, ".pdf");
}
