import { useEffect, useRef } from "react";
import Ably from "ably";

import type { ChatMessage } from "@av/store";
import { fetchAblyToken } from "@av/store";

import { getIdToken } from "../getIdToken";

/** Must match backend `CHAT_MESSAGE_CREATED_EVENT`. */
export const CHAT_MESSAGE_CREATED_EVENT = "message.created";

export function chatThreadChannelName(threadId: string): string {
  return `thread:${threadId}`;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const msg = value as Record<string, unknown>;
  return (
    typeof msg.id === "string" &&
    typeof msg.threadId === "string" &&
    typeof msg.senderId === "string" &&
    typeof msg.body === "string" &&
    typeof msg.createdAt === "string"
  );
}

function parseAblyMessageData(data: unknown): ChatMessage | null {
  if (isChatMessage(data)) return data;
  if (typeof data === "string") {
    try {
      const parsed: unknown = JSON.parse(data);
      return isChatMessage(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

type UseChatThreadRealtimeParams = {
  threadId: string;
  eventId: string | null;
  enabled: boolean;
  /** Called when Ably delivers a new message for this thread. */
  onRealtimeMessage: (message: ChatMessage) => void;
};

/**
 * Subscribe to Ably `thread:{id}` while enabled. Uses POST /chat/ably-token.
 * Cleans up connection on disable / unmount.
 */
export function useChatThreadRealtime({
  threadId,
  eventId,
  enabled,
  onRealtimeMessage,
}: UseChatThreadRealtimeParams) {
  const onRealtimeMessageRef = useRef(onRealtimeMessage);
  onRealtimeMessageRef.current = onRealtimeMessage;

  useEffect(() => {
    if (!enabled || !eventId) return;

    let closed = false;
    let realtime: Ably.Realtime | null = null;

    const connect = async () => {
      try {
        realtime = new Ably.Realtime({
          authCallback: (_tokenParams, callback) => {
            void (async () => {
              try {
                const cognitoToken = await getIdToken();
                if (!cognitoToken) {
                  callback("No session token", null);
                  return;
                }
                const { tokenRequest } = await fetchAblyToken(cognitoToken, {
                  eventId,
                  threadId,
                });
                callback(null, tokenRequest);
              } catch (err) {
                const message =
                  err instanceof Error ? err.message : "Ably auth failed";
                callback(message, null);
              }
            })();
          },
        });

        if (closed) {
          realtime.close();
          return;
        }

        const channel = realtime.channels.get(chatThreadChannelName(threadId));
        channel.subscribe(CHAT_MESSAGE_CREATED_EVENT, (message) => {
          const payload = parseAblyMessageData(message.data);
          if (!payload || payload.threadId !== threadId) return;
          onRealtimeMessageRef.current({
            ...payload,
            editedAt: payload.editedAt ?? null,
            deletedAt: payload.deletedAt ?? null,
          });
        });
      } catch (err) {
        console.error("Failed to connect Ably chat realtime:", err);
      }
    };

    void connect();

    return () => {
      closed = true;
      try {
        realtime?.channels
          .get(chatThreadChannelName(threadId))
          .unsubscribe(CHAT_MESSAGE_CREATED_EVENT);
      } catch {
        // ignore cleanup errors
      }
      realtime?.close();
      realtime = null;
    };
  }, [threadId, eventId, enabled]);
}
