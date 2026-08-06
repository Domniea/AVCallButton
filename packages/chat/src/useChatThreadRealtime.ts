import { useEffect, useRef } from "react";
import Ably from "ably";

import type { ChatMessage } from "@av/store";
import { fetchAblyToken } from "@av/store";

import {
  CHAT_MESSAGE_CREATED_EVENT,
  chatThreadChannelName,
  normalizeAblyChatMessage,
  parseAblyMessageData,
} from "./chatAbly";
import { scheduleAblyTeardown } from "./teardownAbly";
import type { GetIdToken } from "./types";

type UseChatThreadRealtimeParams = {
  threadId: string;
  eventId: string | null;
  enabled: boolean;
  getIdToken: GetIdToken;
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
  getIdToken,
  onRealtimeMessage,
}: UseChatThreadRealtimeParams) {
  const onRealtimeMessageRef = useRef(onRealtimeMessage);
  onRealtimeMessageRef.current = onRealtimeMessage;

  const getIdTokenRef = useRef(getIdToken);
  getIdTokenRef.current = getIdToken;

  useEffect(() => {
    if (!enabled || !eventId) return;

    let closed = false;
    let realtime: Ably.Realtime | null = null;
    let cancelTeardown: (() => void) | null = null;
    let onConnected: (() => void) | null = null;
    const channelName = chatThreadChannelName(threadId);

    const queueTeardown = (client: Ably.Realtime | null) => {
      if (!client) return;
      cancelTeardown?.();
      cancelTeardown = scheduleAblyTeardown(client, [channelName], CHAT_MESSAGE_CREATED_EVENT);
    };

    const onMessage = (message: Ably.Message) => {
      if (closed) return;
      const payload = parseAblyMessageData(message.data);
      if (!payload || payload.threadId !== threadId) return;
      onRealtimeMessageRef.current(normalizeAblyChatMessage(payload));
    };

    const subscribeWhenReady = (client: Ably.Realtime) => {
      const start = () => {
        if (closed) return;
        client.channels
          .get(channelName)
          .subscribe(CHAT_MESSAGE_CREATED_EVENT, onMessage);
      };

      if (client.connection.state === "connected") {
        start();
      } else {
        client.connection.once("connected", start);
        onConnected = start;
      }
    };

    const connect = async () => {
      try {
        const client = new Ably.Realtime({
          authCallback: (_tokenParams, callback) => {
            void (async () => {
              if (closed) {
                callback("Ably connection closed", null);
                return;
              }
              try {
                const cognitoToken = await getIdTokenRef.current();
                if (!cognitoToken || closed) {
                  callback("No session token", null);
                  return;
                }
                const { tokenRequest } = await fetchAblyToken(cognitoToken, {
                  eventId,
                  threadId,
                });
                if (closed) {
                  callback("Ably connection closed", null);
                  return;
                }
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
          queueTeardown(client);
          return;
        }

        realtime = client;
        subscribeWhenReady(client);
      } catch (err) {
        if (!closed) {
          console.error("Failed to connect Ably chat realtime:", err);
        }
      }
    };

    void connect();

    return () => {
      closed = true;
      cancelTeardown?.();
      const client = realtime;
      realtime = null;
      if (client && onConnected) {
        try {
          client.connection.off("connected", onConnected);
        } catch {
          // ignore
        }
      }
      queueTeardown(client);
    };
  }, [threadId, eventId, enabled]);
}
