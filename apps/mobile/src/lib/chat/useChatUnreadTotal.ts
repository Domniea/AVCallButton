import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

import { getIdToken } from "@av/auth-client";
import { fetchChatInbox } from "@av/store";

import { getLastSession } from "../lastSession";

/** Sum of unread chat messages for the current event session. */
export function useChatUnreadTotal(enabled: boolean): number {
  const [total, setTotal] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) {
      setTotal(0);
      return;
    }
    try {
      const session = await getLastSession();
      if (!session) {
        setTotal(0);
        return;
      }
      const token = await getIdToken();
      if (!token) {
        setTotal(0);
        return;
      }
      const { threads } = await fetchChatInbox(
        token,
        session.workspaceId,
        session.eventId,
      );
      setTotal(threads.reduce((sum, row) => sum + row.unreadCount, 0));
    } catch {
      // keep last known total
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setTotal(0);
      return;
    }

    void refresh();
    const interval = setInterval(() => {
      void refresh();
    }, 15_000);

    const appSub = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });

    return () => {
      clearInterval(interval);
      appSub.remove();
    };
  }, [enabled, refresh]);

  return total;
}
