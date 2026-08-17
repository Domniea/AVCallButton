"use client";

import { useCallback, useEffect, useState } from "react";

import { getIdToken } from "@av/auth-client";
import { fetchChatInbox } from "@av/store";

/** Sum of unread messages across inbox threads for an event. */
export function useChatUnreadTotal(
  workspaceId: string | null,
  eventId: string | null,
  enabled: boolean,
): number {
  const [total, setTotal] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled || !workspaceId || !eventId) {
      setTotal(0);
      return;
    }
    try {
      const token = await getIdToken();
      if (!token) {
        setTotal(0);
        return;
      }
      const { threads } = await fetchChatInbox(token, workspaceId, eventId);
      setTotal(threads.reduce((sum, row) => sum + row.unreadCount, 0));
    } catch {
      // keep last known
    }
  }, [enabled, workspaceId, eventId]);

  useEffect(() => {
    void refresh();
    if (!enabled || !workspaceId || !eventId) return;
    const timer = setInterval(() => {
      void refresh();
    }, 20_000);
    return () => clearInterval(timer);
  }, [refresh, enabled, workspaceId, eventId]);

  return total;
}
