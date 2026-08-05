import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { RefreshControl } from "react-native";
import { Text, VStack } from "native-base";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useDispatch, useSelector } from "react-redux";

import type {
  AppDispatch,
  ChatInboxItem,
  ChatMessage,
  ChatThreadType,
  RootState,
} from "@av/store";
import { fetchChatInbox, fetchEventsThunk, fetchRosterThunk } from "@av/store";

import { BaseButton } from "../../../components/BaseButton";
import { BaseCard } from "../../../components/BaseCard";
import { BasePill } from "../../../components/BasePill";
import { ListRow } from "../../../components/ListRow";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { applyInboxRealtimeMessage } from "../../lib/chat/applyInboxRealtimeMessage";
import { useChatInboxRealtime } from "../../lib/chat/useChatInboxRealtime";
import { getIdToken } from "../../lib/getIdToken";
import {
  getLastSession,
  type LastSession,
} from "../../lib/lastSession";
import type { ChatStackParamList } from "../../navigation/types";

type ChatHomeNav = NativeStackNavigationProp<ChatStackParamList, "chatHome">;

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

function threadTypeLabel(type: ChatThreadType): string {
  switch (type) {
    case "EVENT_GROUP":
      return "Event";
    case "ZONE":
      return "Zone";
    case "DM":
      return "DM";
  }
}

function threadTitle(
  item: ChatInboxItem,
  emailByUserId: Map<string, string>,
): string {
  switch (item.type) {
    case "EVENT_GROUP":
      return item.eventName ?? "Event chat";
    case "ZONE":
      return item.zoneName ?? "Zone chat";
    case "DM": {
      if (item.otherUserId) {
        return emailByUserId.get(item.otherUserId) ?? "Direct message";
      }
      return "Direct message";
    }
  }
}

function formatMessagePreview(item: ChatInboxItem): string | undefined {
  const body = item.lastMessage?.body?.trim();
  if (!body) return "No messages yet";
  return body;
}

function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Chat tab inbox for the currently selected workspace + event. */
export default function ChatHome() {
  const navigation = useNavigation<ChatHomeNav>();
  const dispatch = useDispatch<AppDispatch>();
  const { muted, primary } = useThemeColors();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const myUserId = useSelector((state: RootState) => state.auth.user?.id);
  const assignments = useSelector(
    (state: RootState) => state.roster.assignments,
  );
  const events = useSelector((state: RootState) => state.events.events);

  const [session, setSession] = useState<LastSession | null>(null);
  const [threads, setThreads] = useState<ChatInboxItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [inboxFocused, setInboxFocused] = useState(false);

  const emailByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of assignments) {
      if (row.email) map.set(row.userId, row.email);
    }
    return map;
  }, [assignments]);

  const eventName = useMemo(() => {
    if (!session) return null;
    return events.find((e) => e.id === session.eventId)?.name ?? null;
  }, [events, session]);

  const loadInbox = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) setStatus("loading");
    setError(null);

    const nextSession = await getLastSession();
    setSession(nextSession);

    if (!nextSession) {
      setThreads([]);
      setStatus("failed");
      setError("No event selected. Pick an event from the Event tab first.");
      return;
    }

    try {
      const token = await getIdToken();
      if (!token) {
        setThreads([]);
        setStatus("failed");
        setError("No session token");
        return;
      }

      void dispatch(fetchEventsThunk(nextSession.workspaceId));
      void dispatch(fetchRosterThunk(nextSession.eventId));

      const { threads: nextThreads } = await fetchChatInbox(
        token,
        nextSession.workspaceId,
        nextSession.eventId,
      );
      setThreads(nextThreads);
      setStatus("succeeded");
      hasLoadedInboxRef.current = true;
    } catch (err) {
      console.error("Failed to load chat inbox:", err);
      setThreads([]);
      setStatus("failed");
      setError("Could not load chat inbox");
    }
  }, [dispatch]);

  const hasLoadedInboxRef = useRef(false);

  // Keep Ably alive across refocus — only full-screen load on first visit.
  useFocusEffect(
    useCallback(() => {
      setInboxFocused(true);
      if (authStatus !== "authenticated") {
        return () => setInboxFocused(false);
      }
      void loadInbox({ silent: hasLoadedInboxRef.current });
      return () => setInboxFocused(false);
    }, [authStatus, loadInbox]),
  );

  const onInboxRealtimeMessage = useCallback(
    (message: ChatMessage) => {
      setThreads((prev) =>
        applyInboxRealtimeMessage(prev, message, myUserId),
      );
    },
    [myUserId],
  );

  useChatInboxRealtime({
    eventId: session?.eventId ?? null,
    enabled: inboxFocused && authStatus === "authenticated" && !!session?.eventId,
    onRealtimeMessage: onInboxRealtimeMessage,
  });

  // HTTP fallback while inbox is focused (Ably should win; this keeps the list honest).
  useEffect(() => {
    if (
      !inboxFocused ||
      authStatus !== "authenticated" ||
      !session?.workspaceId ||
      !session.eventId
    ) {
      return;
    }

    const workspaceId = session.workspaceId;
    const eventId = session.eventId;

    const tick = () => {
      void (async () => {
        try {
          const token = await getIdToken();
          if (!token) return;
          const { threads: nextThreads } = await fetchChatInbox(
            token,
            workspaceId,
            eventId,
          );
          setThreads(nextThreads);
        } catch {
          // keep silent — pull-to-refresh still works
        }
      })();
    };

    const timer = setInterval(tick, 10_000);
    return () => clearInterval(timer);
  }, [
    inboxFocused,
    authStatus,
    session?.workspaceId,
    session?.eventId,
  ]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadInbox({ silent: true });
    } finally {
      setRefreshing(false);
    }
  }, [loadInbox]);

  if (authStatus === "idle" || authStatus === "loading") {
    return <LoadingScreen message="Checking session…" />;
  }

  if (status === "loading" && threads.length === 0) {
    return <LoadingScreen message="Loading chat…" />;
  }

  const subtitle = eventName
    ? eventName
    : session
      ? "Current event"
      : "Select an event to view chat";

  return (
    <ScreenLayout
      title="Chat"
      subtitle={subtitle}
      maxW="640"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} />
      }
    >
      {session ? (
        <BaseButton
          title="New message"
          variety="secondary"
          btnWidth="auto"
          onPress={() => navigation.navigate("newDm")}
        />
      ) : null}

      {error ? (
        <BaseCard variant="outline">
          <Text fontSize="sm" color={muted}>
            {error}
          </Text>
        </BaseCard>
      ) : null}

      {!error && threads.length === 0 ? (
        <BaseCard variant="outline">
          <Text fontSize="sm" color={muted}>
            No conversations yet for this event. Event and zone chats appear
            when you're on the roster; tap New message to start a DM.
          </Text>
        </BaseCard>
      ) : null}

      {threads.length > 0 ? (
        <VStack space={3}>
          {threads.map((item) => {
            const title = threadTitle(item, emailByUserId);
            return (
              <ListRow
                key={item.id}
                title={title}
                subtitle={formatMessagePreview(item)}
                meta={formatUpdatedAt(item.updatedAt)}
                accentColor={item.unreadCount > 0 ? primary : undefined}
                onPress={() =>
                  navigation.navigate("chatThread", {
                    threadId: item.id,
                    title,
                  })
                }
                rightElement={
                  item.unreadCount > 0 ? (
                    <BasePill
                      label={
                        item.unreadCount > 99
                          ? "99+"
                          : String(item.unreadCount)
                      }
                      variant="primary"
                    />
                  ) : (
                    <BasePill
                      label={threadTypeLabel(item.type)}
                      variant="outline"
                    />
                  )
                }
              />
            );
          })}
        </VStack>
      ) : null}
    </ScreenLayout>
  );
}
