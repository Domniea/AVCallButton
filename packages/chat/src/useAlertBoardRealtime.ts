import { useEffect, useRef } from "react";
import Ably from "ably";

import { fetchAblyToken } from "@av/store";

import {
  ALERT_BOARD_INVALIDATED_EVENT,
  eventAlertBoardChannelName,
  parseAlertBoardInvalidation,
} from "./alertBoardAbly";
import { subscribeAblyChannel } from "./subscribeAblyChannel";
import { scheduleAblyTeardown } from "./teardownAbly";
import type { GetIdToken } from "./types";

type UseAlertBoardRealtimeParams = {
  eventId: string;
  enabled: boolean;
  getIdToken: GetIdToken;
  /** Invalidation only — callers should refetch HTTP board/detail. */
  onInvalidated: () => void;
};

/**
 * Subscribe to Ably `event:{eventId}` for alert-board invalidation.
 * Refetches on message and after reconnect so missed events do not leave a stale board.
 */
export function useAlertBoardRealtime({
  eventId,
  enabled,
  getIdToken,
  onInvalidated,
}: UseAlertBoardRealtimeParams) {
  const onInvalidatedRef = useRef(onInvalidated);
  onInvalidatedRef.current = onInvalidated;

  const getIdTokenRef = useRef(getIdToken);
  getIdTokenRef.current = getIdToken;

  useEffect(() => {
    if (!enabled || !eventId) return;

    let closed = false;
    let realtime: Ably.Realtime | null = null;
    let cancelTeardown: (() => void) | null = null;
    let onConnectedOnce: (() => void) | null = null;
    let onReconnect: (() => void) | null = null;
    const channelName = eventAlertBoardChannelName(eventId);

    const queueTeardown = (client: Ably.Realtime | null) => {
      if (!client) return;
      cancelTeardown?.();
      cancelTeardown = scheduleAblyTeardown(
        client,
        [channelName],
        ALERT_BOARD_INVALIDATED_EVENT,
      );
    };

    const onMessage = (message: Ably.Message) => {
      if (closed) return;
      const payload = parseAlertBoardInvalidation(message.data);
      if (!payload || payload.eventId !== eventId) return;
      onInvalidatedRef.current();
    };

    const subscribeWhenReady = (client: Ably.Realtime) => {
      const start = () => {
        if (closed) return;
        void (async () => {
          try {
            await subscribeAblyChannel(
              client,
              channelName,
              ALERT_BOARD_INVALIDATED_EVENT,
              onMessage,
            );
          } catch (err) {
            if (!closed) {
              console.error(
                "Failed to subscribe Ably alert-board channel:",
                err,
              );
            }
          }
        })();
      };

      if (client.connection.state === "connected") {
        start();
      } else {
        client.connection.once("connected", start);
        onConnectedOnce = start;
      }

      // Recover board state after reconnect (missed invalidations while offline).
      onReconnect = () => {
        if (closed) return;
        if (client.connection.state !== "connected") return;
        onInvalidatedRef.current();
      };
      client.connection.on("connected", onReconnect);
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
                  purpose: "alert-board",
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
          console.error("Failed to connect Ably alert-board realtime:", err);
        }
      }
    };

    void connect();

    return () => {
      closed = true;
      cancelTeardown?.();
      const client = realtime;
      realtime = null;
      if (client) {
        try {
          if (onConnectedOnce) {
            client.connection.off("connected", onConnectedOnce);
          }
          if (onReconnect) {
            client.connection.off("connected", onReconnect);
          }
        } catch {
          // ignore
        }
      }
      queueTeardown(client);
    };
  }, [eventId, enabled]);
}
