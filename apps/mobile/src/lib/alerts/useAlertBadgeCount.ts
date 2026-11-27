import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import { getIdToken } from "@av/auth-client";
import { useAlertBoardRealtime } from "@av/chat";

import { getLastSession, type LastSession } from "../lastSession";
import {
  fetchAndSyncEventAlerts,
  publishAlertBadgeCount,
  subscribeAlertBadgeCount,
} from "./alertBadgeCount";

/** Safety net only — Ably invalidation is the primary refresh path. */
const BACKUP_POLL_MS = 90_000;

/**
 * Active alert count for the Alerts tab badge.
 * Live updates via Ably `alert-board.invalidated` → HTTP sync; slow poll as backup.
 */
export function useAlertBadgeCount(enabled: boolean): number {
  const [total, setTotal] = useState(0);
  const [session, setSession] = useState<LastSession | null>(null);

  const refresh = useCallback(async () => {
    try {
      if (!enabled) {
        setSession(null);
        publishAlertBadgeCount(0);
        return;
      }
      const next = await getLastSession();
      setSession(next);
      if (!next) {
        publishAlertBadgeCount(0);
        return;
      }
      await fetchAndSyncEventAlerts(next.eventId);
    } catch (err) {
      console.error("Failed to load alert badge count:", err);
    }
  }, [enabled]);

  const onInvalidated = useCallback(() => {
    const eventId = session?.eventId;
    if (!eventId) {
      void refresh();
      return;
    }
    void fetchAndSyncEventAlerts(eventId).catch((err) => {
      console.error("Failed to sync alerts after Ably invalidation:", err);
    });
  }, [session?.eventId, refresh]);

  useEffect(() => subscribeAlertBadgeCount(setTotal), []);

  useAlertBoardRealtime({
    eventId: session?.eventId ?? "",
    enabled: enabled && !!session?.eventId,
    getIdToken,
    onInvalidated,
  });

  useEffect(() => {
    if (!enabled) {
      setSession(null);
      publishAlertBadgeCount(0);
      return;
    }

    void refresh();
    const interval = setInterval(() => {
      void refresh();
    }, BACKUP_POLL_MS);

    const appSub = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });

    return () => {
      clearInterval(interval);
      if (appSub && typeof appSub.remove === "function") appSub.remove();
    };
  }, [enabled, refresh]);

  return total;
}
