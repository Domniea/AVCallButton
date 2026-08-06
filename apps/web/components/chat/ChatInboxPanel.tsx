"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";

import { getIdToken } from "@av/auth-client";
import {
  applyInboxRealtimeMessage,
  formatMessagePreview,
  formatUpdatedAt,
  threadTitle,
  threadTypeLabel,
  useChatInboxRealtime,
} from "@av/chat";
import type {
  AppDispatch,
  ChatInboxItem,
  ChatMessage,
  RootState,
} from "@av/store";
import { fetchChatInbox, fetchEventsThunk, fetchRosterThunk } from "@av/store";

import { BaseButton } from "@/components/reusable/BaseButton";
import { ChatAvatar, ChatPaneHeader } from "@/components/chat/ChatShell";

type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

type ChatInboxPanelProps = {
  workspaceId: string;
  eventId: string;
  chatBasePath: string;
  eventHref: string;
};

/** Left-rail inbox for split chat layout. */
export function ChatInboxPanel({
  workspaceId,
  eventId,
  chatBasePath,
  eventHref,
}: ChatInboxPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const myUserId = useSelector((state: RootState) => state.auth.user?.id);
  const assignments = useSelector(
    (state: RootState) => state.roster.assignments,
  );
  const events = useSelector((state: RootState) => state.events.events);

  const [threads, setThreads] = useState<ChatInboxItem[]>([]);
  const [status, setStatus] = useState<LoadStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const activeThreadId = useMemo(() => {
    if (!pathname.startsWith(chatBasePath)) return null;
    const rest = pathname.slice(chatBasePath.length).replace(/^\//, "");
    if (!rest || rest === "new") return null;
    return rest.split("/")[0] ?? null;
  }, [pathname, chatBasePath]);

  const emailByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of assignments) {
      if (row.email) map.set(row.userId, row.email);
    }
    return map;
  }, [assignments]);

  const eventName = useMemo(() => {
    return events.find((e) => e.id === eventId)?.name ?? null;
  }, [events, eventId]);

  const loadInbox = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) setStatus("loading");
      setError(null);

      try {
        const token = await getIdToken();
        if (!token) {
          setThreads([]);
          setStatus("failed");
          setError("No session token");
          return;
        }

        void dispatch(fetchEventsThunk(workspaceId));
        void dispatch(fetchRosterThunk(eventId));

        const { threads: nextThreads } = await fetchChatInbox(
          token,
          workspaceId,
          eventId,
        );
        setThreads(nextThreads);
        setStatus("succeeded");
      } catch (err) {
        console.error("Failed to load chat inbox:", err);
        if (!opts?.silent) {
          setThreads([]);
          setStatus("failed");
          setError("Could not load chat inbox");
        }
      }
    },
    [dispatch, workspaceId, eventId],
  );

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    void loadInbox();
  }, [authStatus, loadInbox]);

  const onInboxRealtimeMessage = useCallback(
    (message: ChatMessage) => {
      setThreads((prev) =>
        applyInboxRealtimeMessage(prev, message, myUserId),
      );
    },
    [myUserId],
  );

  useChatInboxRealtime({
    eventId,
    enabled: authStatus === "authenticated",
    getIdToken,
    onRealtimeMessage: onInboxRealtimeMessage,
  });

  useEffect(() => {
    if (authStatus !== "authenticated") return;

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
          // keep silent
        }
      })();
    };

    const timer = setInterval(tick, 10_000);
    return () => clearInterval(timer);
  }, [authStatus, workspaceId, eventId]);

  const unreadTotal = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  return (
    <VStack align="stretch" gap={0} h="100%" minH={0}>
      <ChatPaneHeader
        title="Chat"
        subtitle={
          eventName
            ? `${eventName}${unreadTotal > 0 ? ` · ${unreadTotal} unread` : ""}`
            : "Event conversations"
        }
        headerRight={
          <>
            <BaseButton
              title="New"
              variety="primary"
              btnWidth="auto"
              onClick={() => router.push(`${chatBasePath}/new`)}
            />
            <BaseButton
              title="Event"
              variety="tertiary"
              btnWidth="auto"
              onClick={() => router.push(eventHref)}
            />
          </>
        }
      />

      <Box flex={1} minH={0} overflowY="auto" bg="surface">
        {status === "loading" && threads.length === 0 ? (
          <Text color="gray.500" px={4} py={6} fontSize="sm">
            Loading…
          </Text>
        ) : null}

        {error ? (
          <VStack align="start" gap={3} px={4} py={5}>
            <Text fontSize="sm" color="gray.500">
              {error}
            </Text>
            <BaseButton
              title="Retry"
              variety="secondary"
              btnWidth="auto"
              onClick={() => void loadInbox()}
            />
          </VStack>
        ) : null}

        {!error && status === "succeeded" && threads.length === 0 ? (
          <VStack align="center" gap={2} px={4} py={10} textAlign="center">
            <Text fontSize="sm" fontWeight="medium" color="text">
              No conversations yet
            </Text>
            <Text fontSize="xs" color="gray.500">
              Start a DM or wait for event / zone chats.
            </Text>
          </VStack>
        ) : null}

        {threads.length > 0 ? (
          <VStack align="stretch" gap={0} divideY="1px" divideColor="cardBorder">
            {threads.map((item) => {
              const title = threadTitle(item, emailByUserId);
              const href = `${chatBasePath}/${item.id}?title=${encodeURIComponent(title)}`;
              const unread = item.unreadCount > 0;
              const active = activeThreadId === item.id;
              return (
                <Link
                  key={item.id}
                  href={href}
                  style={{ textDecoration: "none" }}
                >
                  <HStack
                    gap={3}
                    px={4}
                    py={3}
                    bg={active ? "bg" : unread ? "bg" : "transparent"}
                    _hover={{ bg: "bg" }}
                    transition="background 0.12s ease"
                    borderLeftWidth={3}
                    borderLeftColor={
                      active
                        ? "buttonPrimaryBg"
                        : unread
                          ? "buttonPrimaryBg"
                          : "transparent"
                    }
                    opacity={active ? 1 : unread ? 1 : 0.92}
                  >
                    <ChatAvatar label={title} />
                    <Box minW={0} flex={1}>
                      <HStack justify="space-between" gap={2} align="baseline">
                        <Text
                          fontSize="sm"
                          fontWeight={unread || active ? "semibold" : "medium"}
                          color="text"
                          truncate
                        >
                          {title}
                        </Text>
                        <Text fontSize="2xs" color="gray.500" flexShrink={0}>
                          {formatUpdatedAt(item.updatedAt)}
                        </Text>
                      </HStack>
                      <HStack
                        justify="space-between"
                        gap={2}
                        mt={0.5}
                        align="center"
                      >
                        <Text fontSize="xs" color="gray.500" truncate>
                          {formatMessagePreview(item)}
                        </Text>
                        <Badge
                          size="sm"
                          variant={unread ? "solid" : "outline"}
                          colorPalette={unread ? "blue" : "gray"}
                          flexShrink={0}
                        >
                          {unread
                            ? item.unreadCount > 99
                              ? "99+"
                              : String(item.unreadCount)
                            : threadTypeLabel(item.type)}
                        </Badge>
                      </HStack>
                    </Box>
                  </HStack>
                </Link>
              );
            })}
          </VStack>
        ) : null}
      </Box>
    </VStack>
  );
}
