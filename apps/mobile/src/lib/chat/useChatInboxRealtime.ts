import { useEffect, useRef } from "react";
import Ably from "ably";

import type { ChatMessage } from "@av/store";
import { fetchAblyToken } from "@av/store";

import { getIdToken } from "../getIdToken";
import {
  CHAT_MESSAGE_CREATED_EVENT,
  normalizeAblyChatMessage,
  parseAblyMessageData,
} from "./chatAbly";

type UseChatInboxRealtimeParams = {
  eventId: string | null;
  enabled: boolean;
  onRealtimeMessage: (message: ChatMessage) => void;
};

/**
 * Subscribe to every `thread:{id}` the user belongs to on this event
 * (same Ably pattern as open-thread).
 */
export function useChatInboxRealtime({
  eventId,
  enabled,
  onRealtimeMessage,
}: UseChatInboxRealtimeParams) {
  const onRealtimeMessageRef = useRef(onRealtimeMessage);
  onRealtimeMessageRef.current = onRealtimeMessage;

  useEffect(() => {
    if (!enabled || !eventId) return;

    let closed = false;
    let realtime: Ably.Realtime | null = null;
    const subscribed: string[] = [];

    const connect = async () => {
      try {
        const cognitoToken = await getIdToken();
        if (!cognitoToken || closed) return;

        const { channels } = await fetchAblyToken(cognitoToken, { eventId });
        if (closed || channels.length === 0) return;

        realtime = new Ably.Realtime({
          authCallback: (_tokenParams, callback) => {
            void (async () => {
              try {
                const token = await getIdToken();
                if (!token) {
                  callback("No session token", null);
                  return;
                }
                const next = await fetchAblyToken(token, { eventId });
                callback(null, next.tokenRequest);
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

        for (const channelName of channels) {
          const channel = realtime.channels.get(channelName);
          channel.subscribe(CHAT_MESSAGE_CREATED_EVENT, (message) => {
            const payload = parseAblyMessageData(message.data);
            if (!payload) return;
            onRealtimeMessageRef.current(normalizeAblyChatMessage(payload));
          });
          subscribed.push(channelName);
        }
      } catch (err) {
        console.error("Failed to connect Ably inbox realtime:", err);
      }
    };

    void connect();

    return () => {
      closed = true;
      if (realtime) {
        for (const name of subscribed) {
          try {
            realtime.channels.get(name).unsubscribe(CHAT_MESSAGE_CREATED_EVENT);
          } catch {
            // ignore
          }
        }
        realtime.close();
      }
      realtime = null;
    };
  }, [eventId, enabled]);
}
