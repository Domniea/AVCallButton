"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type UIEvent,
} from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";

import { getIdToken } from "@av/auth-client";
import { mergeMessagesById, useChatThreadRealtime } from "@av/chat";
import type { ChatMessage, RootState } from "@av/store";
import {
  createThreadMessage,
  listThreadMessages,
  markThreadRead,
} from "@av/store";

import { BaseButton } from "@/components/reusable/BaseButton";
import { BaseInput } from "@/components/reusable/BaseInput";
import { ChatPaneHeader } from "@/components/chat/ChatShell";

const POLL_MS = 10_000;
const NEAR_BOTTOM_PX = 80;

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

type ChatThreadProps = {
  threadId: string;
  eventId: string;
  title?: string | null;
  chatBasePath: string;
};

/** Right-pane thread view for split chat layout. */
export function ChatThread({
  threadId,
  eventId,
  title,
  chatBasePath,
}: ChatThreadProps) {
  const router = useRouter();
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const myUserId = useSelector((state: RootState) => state.auth.user?.id);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const stickToBottomRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

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
        return mergeMessagesById(prev, [message], "append");
      });
      void (async () => {
        const token = await getIdToken();
        if (!token) return;
        await markLatestRead(token, [message]);
      })();
      if (stickToBottomRef.current) {
        requestAnimationFrame(() => scrollToBottom("smooth"));
      }
    },
    [markLatestRead, scrollToBottom],
  );

  useChatThreadRealtime({
    threadId,
    eventId,
    enabled: authStatus === "authenticated",
    getIdToken,
    onRealtimeMessage: appendRealtimeMessage,
  });

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
      requestAnimationFrame(() => scrollToBottom("auto"));
    }
  }, [threadId, markLatestRead, scrollToBottom]);

  const loadOlder = useCallback(async () => {
    const oldest = messagesRef.current[0];
    if (!oldest || !hasMore || loadingOlder) return;
    setLoadingOlder(true);
    const el = listRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    try {
      const token = await getIdToken();
      if (!token) return;
      const { messages: page, hasMore: more } = await listThreadMessages(
        token,
        threadId,
        { limit: 50, before: oldest.id },
      );
      setMessages((prev) => mergeMessagesById(prev, page, "prepend"));
      setHasMore(more);
      requestAnimationFrame(() => {
        if (!el) return;
        el.scrollTop = el.scrollHeight - prevHeight;
      });
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
        const next = mergeMessagesById(prev, page, "append");
        void markLatestRead(token, next);
        return next;
      });
      if (stickToBottomRef.current) {
        requestAnimationFrame(() => scrollToBottom("smooth"));
      }
    } catch (err) {
      console.error("Failed to poll messages:", err);
    }
  }, [threadId, markLatestRead, scrollToBottom]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    void loadInitial();
  }, [authStatus, loadInitial]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    const timer = setInterval(() => {
      void pollNewer();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [authStatus, pollNewer]);

  const onScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      const el = event.currentTarget;
      const distanceFromBottom =
        el.scrollHeight - (el.scrollTop + el.clientHeight);
      stickToBottomRef.current = distanceFromBottom < NEAR_BOTTOM_PX;

      if (el.scrollTop < 40 && hasMore && !loadingOlder) {
        void loadOlder();
      }
    },
    [hasMore, loadingOlder, loadOlder],
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
      setMessages((prev) => mergeMessagesById(prev, [message], "append"));
      stickToBottomRef.current = true;
      await markLatestRead(token, [message]);
      requestAnimationFrame(() => scrollToBottom("smooth"));
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Could not send message");
    } finally {
      setSending(false);
    }
  }, [draft, sending, threadId, markLatestRead, scrollToBottom]);

  const onComposerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        void onSend();
      }
    },
    [onSend],
  );

  const onSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      void onSend();
    },
    [onSend],
  );

  return (
    <VStack align="stretch" gap={0} h="100%" minH={0}>
      <ChatPaneHeader
        title={title?.trim() ? title : "Chat"}
        subtitle="Conversation"
        headerRight={
          <BaseButton
            title="Back"
            variety="tertiary"
            btnWidth="auto"
            onClick={() => router.push(chatBasePath)}
          />
        }
      />

      <Box
        ref={listRef}
        flex={1}
        minH={0}
        overflowY="auto"
        px={{ base: 4, md: 5 }}
        py={4}
        bg="bg"
        onScroll={onScroll}
        backgroundImage="radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--chakra-colors-cardBorder) 55%, transparent) 1px, transparent 0)"
        backgroundSize="18px 18px"
      >
        {loading && messages.length === 0 ? (
          <Text color="gray.500" textAlign="center" py={10}>
            Loading messages…
          </Text>
        ) : null}

        {loadingOlder ? (
          <Text fontSize="xs" color="gray.500" textAlign="center" mb={3}>
            Loading older…
          </Text>
        ) : null}

        {!loading && messages.length === 0 ? (
          <VStack align="center" gap={2} py={16} textAlign="center">
            <Text fontSize="md" fontWeight="medium" color="text">
              No messages yet
            </Text>
            <Text fontSize="sm" color="gray.500">
              Say hello to start the thread.
            </Text>
          </VStack>
        ) : null}

        <VStack align="stretch" gap={3} justify="flex-end" minH="100%">
          {messages.map((item) => {
            const mine = item.senderId === myUserId;
            return (
              <HStack
                key={item.id}
                justify={mine ? "flex-end" : "flex-start"}
              >
                <Box
                  maxW={{ base: "88%", md: "72%" }}
                  bg={mine ? "buttonPrimaryBg" : "surfaceElevated"}
                  color={mine ? "buttonPrimaryFg" : "text"}
                  borderWidth={mine ? 0 : 1}
                  borderColor="cardBorder"
                  borderRadius="xl"
                  borderBottomRightRadius={mine ? "sm" : "xl"}
                  borderBottomLeftRadius={mine ? "xl" : "sm"}
                  px={4}
                  py={2.5}
                  shadow={mine ? undefined : "sm"}
                >
                  <Text fontSize="md" whiteSpace="pre-wrap" lineHeight="1.5">
                    {item.body}
                  </Text>
                  <Text
                    fontSize="xs"
                    opacity={0.75}
                    mt={1.5}
                    textAlign="right"
                  >
                    {formatTime(item.createdAt)}
                  </Text>
                </Box>
              </HStack>
            );
          })}
        </VStack>
      </Box>

      <Box
        as="form"
        onSubmit={onSubmit}
        flexShrink={0}
        borderTopWidth={1}
        borderTopColor="cardBorder"
        bg="surface"
        px={{ base: 3, md: 4 }}
        py={3}
      >
        {error ? (
          <Text fontSize="xs" color="red.500" mb={2}>
            {error}
          </Text>
        ) : null}
        <HStack gap={2} align="flex-end">
          <Box flex={1}>
            <BaseInput
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onComposerKeyDown}
              placeholder="Write a message…"
              autoComplete="off"
            />
          </Box>
          <BaseButton
            title={sending ? "…" : "Send"}
            variety="primary"
            btnWidth="auto"
            type="submit"
            disabled={sending || !draft.trim()}
          />
        </HStack>
      </Box>
    </VStack>
  );
}
