import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";
import { Box, HStack, Text } from "native-base";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";

import type { ChatMessage, RootState } from "@av/store";
import {
  createThreadMessage,
  listThreadMessages,
  markThreadRead,
} from "@av/store";

import { BaseButton } from "../../../components/BaseButton";
import { BaseInput } from "../../../components/BaseInput";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useChatThreadRealtime } from "../../lib/chat/useChatThreadRealtime";
import { getIdToken } from "../../lib/getIdToken";
import { getLastSession } from "../../lib/lastSession";
import type { ChatStackParamList } from "../../navigation/types";

type ThreadNav = NativeStackNavigationProp<ChatStackParamList, "chatThread">;
type ThreadRoute = RouteProp<ChatStackParamList, "chatThread">;

const POLL_MS = 10_000;

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function mergeById(
  existing: ChatMessage[],
  incoming: ChatMessage[],
  mode: "prepend" | "append" | "replace",
): ChatMessage[] {
  if (mode === "replace") return incoming;
  const map = new Map<string, ChatMessage>();
  const ordered =
    mode === "prepend" ? [...incoming, ...existing] : [...existing, ...incoming];
  for (const msg of ordered) {
    if (!map.has(msg.id)) map.set(msg.id, msg);
  }
  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

/** Messenger for one thread — Ably realtime + poll fallback while focused. */
export default function ChatThreadScreen() {
  const navigation = useNavigation<ThreadNav>();
  const route = useRoute<ThreadRoute>();
  const { threadId, title } = route.params;
  const { bg, surface, text, muted, primary, border } = useThemeColors();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const myUserId = useSelector((state: RootState) => state.auth.user?.id);

  const [eventId, setEventId] = useState<string | null>(null);
  const [threadFocused, setThreadFocused] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<FlatList<ChatMessage>>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  /** Keep pinned to newest unless the user has scrolled up to read history. */
  const stickToBottomRef = useRef(true);

  const scrollToBottom = useCallback((animated: boolean) => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated });
    });
  }, []);

  useEffect(() => {
    navigation.setOptions({ title: title || "Chat" });
  }, [navigation, title]);

  const markLatestRead = useCallback(
    async (token: string, list: ChatMessage[]) => {
      const latest = list[list.length - 1];
      if (!latest) return;
      try {
        await markThreadRead(token, threadId, latest.id);
      } catch (err) {
        console.error("Failed to mark thread read:", err);
      }
    },
    [threadId],
  );

  const appendRealtimeMessage = useCallback(
    (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return mergeById(prev, [message], "append");
      });
      void (async () => {
        const token = await getIdToken();
        if (!token) return;
        await markLatestRead(token, [message]);
      })();
      if (stickToBottomRef.current) {
        scrollToBottom(true);
      }
    },
    [markLatestRead, scrollToBottom],
  );

  useChatThreadRealtime({
    threadId,
    eventId,
    enabled:
      threadFocused && authStatus === "authenticated" && eventId != null,
    onRealtimeMessage: appendRealtimeMessage,
  });

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const session = await getLastSession();
      setEventId(session?.eventId ?? null);

      const token = await getIdToken();
      if (!token) {
        setError("No session token");
        return;
      }
      const { messages: page, hasMore: more } = await listThreadMessages(
        token,
        threadId,
        { limit: 50 },
      );
      setMessages(page);
      setHasMore(more);
      stickToBottomRef.current = true;
      await markLatestRead(token, page);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setError("Could not load messages");
    } finally {
      setLoading(false);
      // After layout settles on first paint.
      setTimeout(() => scrollToBottom(false), 50);
    }
  }, [threadId, markLatestRead, scrollToBottom]);

  const loadOlder = useCallback(async () => {
    const oldest = messagesRef.current[0];
    if (!oldest || !hasMore || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const token = await getIdToken();
      if (!token) return;
      const { messages: page, hasMore: more } = await listThreadMessages(
        token,
        threadId,
        { limit: 50, before: oldest.id },
      );
      setMessages((prev) => mergeById(prev, page, "prepend"));
      setHasMore(more);
    } catch (err) {
      console.error("Failed to load older messages:", err);
    } finally {
      setLoadingOlder(false);
    }
  }, [hasMore, loadingOlder, threadId]);

  const pollNewer = useCallback(async () => {
    const newest = messagesRef.current[messagesRef.current.length - 1];
    try {
      const token = await getIdToken();
      if (!token) return;
      const { messages: page } = await listThreadMessages(token, threadId, {
        limit: 50,
        ...(newest ? { after: newest.id } : {}),
      });
      if (page.length === 0) return;
      setMessages((prev) => {
        const next = mergeById(prev, page, "append");
        void markLatestRead(token, next);
        return next;
      });
      if (stickToBottomRef.current) {
        scrollToBottom(true);
      }
    } catch (err) {
      console.error("Failed to poll messages:", err);
    }
  }, [threadId, markLatestRead, scrollToBottom]);

  useFocusEffect(
    useCallback(() => {
      if (authStatus !== "authenticated") return;
      setThreadFocused(true);
      void loadInitial();
      const timer = setInterval(() => {
        void pollNewer();
      }, POLL_MS);
      return () => {
        setThreadFocused(false);
        clearInterval(timer);
      };
    }, [authStatus, loadInitial, pollNewer]),
  );

  const onSend = useCallback(async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    try {
      const token = await getIdToken();
      if (!token) {
        setError("No session token");
        return;
      }
      const { message } = await createThreadMessage(token, threadId, body);
      setDraft("");
      setMessages((prev) => mergeById(prev, [message], "append"));
      stickToBottomRef.current = true;
      await markLatestRead(token, [message]);
      scrollToBottom(true);
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Could not send message");
    } finally {
      setSending(false);
    }
  }, [draft, sending, threadId, markLatestRead, scrollToBottom]);

  if (authStatus === "idle" || authStatus === "loading") {
    return <LoadingScreen message="Checking session…" />;
  }

  if (loading && messages.length === 0) {
    return <LoadingScreen message="Loading messages…" />;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
    >
      <Box flex={1} bg={bg}>
        {error ? (
          <Box px={4} py={2}>
            <Text fontSize="sm" color={muted}>
              {error}
            </Text>
          </Box>
        ) : null}

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            flexGrow: 1,
            justifyContent: messages.length === 0 ? "center" : "flex-end",
          }}
          onContentSizeChange={() => {
            if (stickToBottomRef.current) {
              listRef.current?.scrollToEnd({ animated: false });
            }
          }}
          onScroll={(event) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              event.nativeEvent;
            const distanceFromBottom =
              contentSize.height -
              (contentOffset.y + layoutMeasurement.height);
            stickToBottomRef.current = distanceFromBottom < 80;
          }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl
              refreshing={loadingOlder}
              onRefresh={() => void loadOlder()}
            />
          }
          ListEmptyComponent={
            <Text fontSize="sm" color={muted} textAlign="center">
              No messages yet. Say hello.
            </Text>
          }
          renderItem={({ item }) => {
            const mine = item.senderId === myUserId;
            return (
              <HStack
                justifyContent={mine ? "flex-end" : "flex-start"}
                mb={2}
              >
                <Box
                  maxW="80%"
                  bg={mine ? primary : surface}
                  borderWidth={mine ? 0 : 1}
                  borderColor={border}
                  borderRadius="lg"
                  px={3}
                  py={2}
                >
                  <Text fontSize="md" color={mine ? "white" : text}>
                    {item.body}
                  </Text>
                  <Text
                    fontSize="2xs"
                    color={mine ? "white" : muted}
                    opacity={0.8}
                    mt={1}
                    textAlign="right"
                  >
                    {formatTime(item.createdAt)}
                  </Text>
                </Box>
              </HStack>
            );
          }}
        />

        <HStack
          px={3}
          py={3}
          space={2}
          alignItems="flex-end"
          borderTopWidth={1}
          borderTopColor={border}
          bg={surface}
        >
          <Box flex={1}>
            <BaseInput
              value={draft}
              onChangeText={setDraft}
              placeholder="Message"
              returnKeyType="send"
              onSubmitEditing={() => void onSend()}
              blurOnSubmit={false}
            />
          </Box>
          <BaseButton
            title={sending ? "…" : "Send"}
            variety="primary"
            btnWidth="auto"
            isDisabled={sending || !draft.trim()}
            onPress={() => void onSend()}
          />
        </HStack>
      </Box>
    </KeyboardAvoidingView>
  );
}
