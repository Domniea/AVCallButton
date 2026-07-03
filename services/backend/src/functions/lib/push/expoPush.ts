import type { PushNotification } from "./types";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const CHUNK_SIZE = 100;

const EXPO_PUSH_TOKEN_RE = /^Expo(?:nent)?PushToken\[[^\]]+\]$/;

const STALE_TOKEN_ERRORS = new Set(["DeviceNotRegistered"]);

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data?: PushNotification["data"];
  sound: "default";
  priority: "high";
};

type ExpoTicket =
  | { status: "ok"; id: string }
  | {
      status: "error";
      message: string;
      details?: { error?: string };
    };

type ExpoPushResponse = {
  data: ExpoTicket[];
};

export function isExpoPushToken(token: string): boolean {
  return EXPO_PUSH_TOKEN_RE.test(token.trim());
}

function buildMessages(
  tokens: string[],
  notification: PushNotification,
): ExpoPushMessage[] {
  return tokens.map((token) => ({
    to: token,
    title: notification.title,
    body: notification.body,
    ...(notification.data ? { data: notification.data } : {}),
    sound: "default",
    priority: "high",
  }));
}

function staleTokensFromTickets(
  tokens: string[],
  tickets: ExpoTicket[],
): string[] {
  const stale: string[] = [];

  tickets.forEach((ticket, index) => {
    if (ticket.status !== "error") return;
    const errorCode = ticket.details?.error;
    if (!errorCode || !STALE_TOKEN_ERRORS.has(errorCode)) return;
    const token = tokens[index];
    if (token) stale.push(token);
  });

  return stale;
}

async function sendChunk(
  tokens: string[],
  notification: PushNotification,
): Promise<string[]> {
  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildMessages(tokens, notification)),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Expo push request failed (${response.status}): ${body || response.statusText}`,
    );
  }

  const payload = (await response.json()) as ExpoPushResponse;
  const tickets = payload.data ?? [];

  if (tickets.length !== tokens.length) {
    console.warn("Expo push ticket count mismatch", {
      tokens: tokens.length,
      tickets: tickets.length,
    });
  }

  for (const ticket of tickets) {
    if (ticket.status === "error") {
      console.warn("Expo push ticket error:", ticket.message, ticket.details);
    }
  }

  return staleTokensFromTickets(tokens, tickets);
}

/** Send push notifications via Expo; returns tokens that should be removed from the DB. */
export async function sendExpoPush(
  tokens: string[],
  notification: PushNotification,
): Promise<{ staleTokens: string[] }> {
  const validTokens = [
    ...new Set(tokens.map((token) => token.trim()).filter(isExpoPushToken)),
  ];

  if (validTokens.length === 0) {
    return { staleTokens: [] };
  }

  const staleTokens: string[] = [];

  for (let i = 0; i < validTokens.length; i += CHUNK_SIZE) {
    const chunk = validTokens.slice(i, i + CHUNK_SIZE);
    const stale = await sendChunk(chunk, notification);
    staleTokens.push(...stale);
  }

  return { staleTokens: [...new Set(staleTokens)] };
}
