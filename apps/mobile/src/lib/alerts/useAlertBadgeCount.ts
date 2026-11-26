import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import { getLastSession } from "../lastSession";
import {
  fetchAndSyncEventAlerts,
  publishAlertBadgeCount,
  subscribeAlertBadgeCount,
} from "./alertBadgeCount";

const BADGE_POLL_MS = 5_000;

/** Active alert count for the Alerts tab badge (any open help request). */
export function useAlertBadgeCount(enabled: boolean): number {
  const [total, setTotal] = useState(0);

  const refresh = useCallback(async () => {
    try {
      if (!enabled) {
        publishAlertBadgeCount(0);
        return;
      }
      const session = await getLastSession();
      if (!session) {
        publishAlertBadgeCount(0);
        return;
      }
      await fetchAndSyncEventAlerts(session.eventId);
    } catch (err) {
      console.error("Failed to load alert badge count:", err);
    }
  }, [enabled]);

  useEffect(() => subscribeAlertBadgeCount(setTotal), []);

  useEffect(() => {
    if (!enabled) {
      publishAlertBadgeCount(0);
      return;
    }

    void refresh();
    const interval = setInterval(() => {
      void refresh();
    }, BADGE_POLL_MS);

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
