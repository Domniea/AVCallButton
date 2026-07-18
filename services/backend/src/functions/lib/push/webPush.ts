import webpush, { WebPushError, type PushSubscription } from "web-push";

import type { PushNotification } from "./types";

const STALE_STATUS_CODES = new Set([404, 410]);

type WebPushPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

function parseSubscription(token: string): PushSubscription | null {
  try {
    const parsed = JSON.parse(token) as PushSubscription;
    if (typeof parsed.endpoint !== "string" || parsed.endpoint.length === 0) {
      return null;
    }
    if (
      typeof parsed.keys?.p256dh !== "string" ||
      typeof parsed.keys?.auth !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function isWebPushSubscription(token: string): boolean {
  return parseSubscription(token.trim()) !== null;
}

function configureVapid(): boolean {
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim();
  const privateKey = process.env.VAPID_PRIVATE_KEY?.trim();
  const subject =
    process.env.VAPID_SUBJECT?.trim() ?? "mailto:domniea@gmail.com";

  if (!publicKey || !privateKey) {
    console.warn("VAPID keys not configured; skipping web push");
    return false;
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

function buildPayload(notification: PushNotification): string {
  const data: Record<string, string> = {
    url: notification.data?.url ?? "/dashboard",
  };
  if (notification.data?.alertId) {
    data.alertId = notification.data.alertId;
  }
  if (notification.data?.eventId) {
    data.eventId = notification.data.eventId;
  }
  if (notification.data?.roomId) {
    data.roomId = notification.data.roomId;
  }

  const payload: WebPushPayload = {
    title: notification.title,
    body: notification.body,
    data,
  };
  return JSON.stringify(payload);
}

/** Send web push notifications; returns subscription JSON tokens to remove from the DB. */
export async function sendWebPush(
  tokens: string[],
  notification: PushNotification,
): Promise<{ staleTokens: string[] }> {
  if (!configureVapid()) {
    return { staleTokens: [] };
  }

  const payload = buildPayload(notification);
  const staleTokens: string[] = [];

  await Promise.all(
    tokens.map(async (token) => {
      const subscription = parseSubscription(token);
      if (!subscription) return;

      try {
        await webpush.sendNotification(subscription, payload);
      } catch (error) {
        if (
          error instanceof WebPushError &&
          STALE_STATUS_CODES.has(error.statusCode)
        ) {
          staleTokens.push(token);
          return;
        }
        console.warn("Web push delivery failed:", error);
      }
    }),
  );

  return { staleTokens: [...new Set(staleTokens)] };
}
