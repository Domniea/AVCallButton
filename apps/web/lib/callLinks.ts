/** Production guest web app — QR / call links always target this unless overridden. */
const DEFAULT_GUEST_APP_URL = "https://av-call-button-web.vercel.app";

/** Public guest URL for a room's QR / call link. */
export function buildGuestCallUrl(callToken: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? DEFAULT_GUEST_APP_URL;
  return `${base}/c/${encodeURIComponent(callToken)}`;
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
