import { useEffect, useRef } from "react";
import Ably from "ably";

import type { ChatMessage } from "@av/store";
import { fetchAblyToken } from "@av/store";

import {
  CHAT_MESSAGE_CREATED_EVENT,
  normalizeAblyChatMessage,
  parseAblyMessageData,
} from "./chatAbly";
import { scheduleAblyTeardown } from "./teardownAbly";
import type { GetIdToken } from "./types";

type UseChatInboxRealtimeParams = {
  eventId: string | null;
  enabled: boolean;
  getIdToken: GetIdToken;
  onRealtimeMessage: (message: ChatMessage) => void;
};

/**
 * Subscribe to every `thread:{id}` the user belongs to on this event.
 */
export function useChatInboxRealtime({
  eventId,
  enabled,
  getIdToken,
  onRealtimeMessage,
}: UseChatInboxRealtimeParams) {
  const onRealtimeMessageRef = useRef(onRealtimeMessage);
  onRealtimeMessageRef.current = onRealtimeMessage;

  const getIdTokenRef = useRef(getIdToken);
  getIdTokenRef.current = getIdToken;

  useEffect(() => {
    if (!enabled || !eventId) return;

    let closed = false;
    let realtime: Ably.Realtime | null = null;
    let channelNames: string[] = [];
    let cancelTeardown: (() => void) | null = null;
    let onConnected: (() => void) | null = null;

    const queueTeardown = (client: Ably.Realtime | null) => {
      if (!client) return;
      cancelTeardown?.();
      cancelTeardown = scheduleAblyTeardown(
        client,
        channelNames,
        CHAT_MESSAGE_CREATED_EVENT,
      );
    };

    const onMessage = (message: Ably.Message) => {
      if (closed) return;
      const payload = parseAblyMessageData(message.data);
      if (!payload) return;
      onRealtimeMessageRef.current(normalizeAblyChatMessage(payload));
    };

    const subscribeWhenReady = (client: Ably.Realtime, channels: string[]) => {
      const start = () => {
        if (closed) return;
        for (const name of channels) {
          client.channels
            .get(name)
            .subscribe(CHAT_MESSAGE_CREATED_EVENT, onMessage);
        }
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
        const cognitoToken = await getIdTokenRef.current();
        if (!cognitoToken || closed) return;

        const { channels } = await fetchAblyToken(cognitoToken, { eventId });
        if (closed || channels.length === 0) return;
        channelNames = channels;

        const client = new Ably.Realtime({
          authCallback: (_tokenParams, callback) => {
            void (async () => {
              if (closed) {
                callback("Ably connection closed", null);
                return;
              }
              try {
                const token = await getIdTokenRef.current();
                if (!token || closed) {
                  callback("No session token", null);
                  return;
                }
                const next = await fetchAblyToken(token, { eventId });
                if (closed) {
                  callback("Ably connection closed", null);
                  return;
                }
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
          queueTeardown(client);
          return;
        }

        realtime = client;
        subscribeWhenReady(client, channels);
      } catch (err) {
        if (!closed) {
          console.error("Failed to connect Ably inbox realtime:", err);
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
  }, [eventId, enabled]);
}
