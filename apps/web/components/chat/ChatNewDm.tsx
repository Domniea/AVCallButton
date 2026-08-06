"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Box, HStack, Text, VStack } from "@chakra-ui/react";

import { getIdToken } from "@av/auth-client";
import type { AppDispatch, RootState } from "@av/store";
import { fetchRosterThunk, openDmThread } from "@av/store";

import { BaseButton } from "@/components/reusable/BaseButton";
import { ChatAvatar, ChatPaneHeader } from "@/components/chat/ChatShell";

type ChatNewDmProps = {
  workspaceId: string;
  eventId: string;
  chatBasePath: string;
};

/** Right-pane new DM picker for split chat layout. */
export function ChatNewDm({
  workspaceId,
  eventId,
  chatBasePath,
}: ChatNewDmProps) {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const myUserId = useSelector((state: RootState) => state.auth.user?.id);
  const assignments = useSelector(
    (state: RootState) => state.roster.assignments,
  );
  const rosterFetchStatus = useSelector(
    (state: RootState) => state.roster.fetchStatus,
  );
  const rosterFetchError = useSelector(
    (state: RootState) => state.roster.fetchError,
  );

  const [openingUserId, setOpeningUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    void dispatch(fetchRosterThunk(eventId));
  }, [authStatus, dispatch, eventId]);

  const candidates = useMemo(() => {
    const seen = new Set<string>();
    return assignments.filter((row) => {
      if (!row.userId || row.userId === myUserId) return false;
      if (seen.has(row.userId)) return false;
      seen.add(row.userId);
      return true;
    });
  }, [assignments, myUserId]);

  const onPick = useCallback(
    async (otherUserId: string, label: string) => {
      if (openingUserId) return;
      setOpeningUserId(otherUserId);
      setError(null);
      try {
        const token = await getIdToken();
        if (!token) {
          setError("No session token");
          return;
        }
        const { thread } = await openDmThread(token, {
          workspaceId,
          eventId,
          otherUserId,
        });
        router.push(
          `${chatBasePath}/${thread.id}?title=${encodeURIComponent(label)}`,
        );
      } catch (err) {
        console.error("Failed to open DM:", err);
        setError("Could not open direct message");
      } finally {
        setOpeningUserId(null);
      }
    },
    [openingUserId, workspaceId, eventId, chatBasePath, router],
  );

  return (
    <VStack align="stretch" gap={0} h="100%" minH={0}>
      <ChatPaneHeader
        title="New message"
        subtitle="People on this event"
        headerRight={
          <BaseButton
            title="Back"
            variety="tertiary"
            btnWidth="auto"
            onClick={() => router.push(chatBasePath)}
          />
        }
      />

      <Box flex={1} minH={0} overflowY="auto" bg="surface">
        {error || rosterFetchError ? (
          <VStack align="start" gap={3} px={5} py={6}>
            <Text fontSize="sm" color="gray.500">
              {error ?? rosterFetchError}
            </Text>
            {rosterFetchError ? (
              <BaseButton
                title="Retry"
                variety="secondary"
                btnWidth="auto"
                onClick={() => void dispatch(fetchRosterThunk(eventId))}
              />
            ) : null}
          </VStack>
        ) : null}

        {rosterFetchStatus === "loading" && candidates.length === 0 ? (
          <Text color="gray.500" px={5} py={8}>
            Loading roster…
          </Text>
        ) : null}

        {rosterFetchStatus !== "loading" &&
        !rosterFetchError &&
        candidates.length === 0 ? (
          <VStack align="center" gap={2} px={6} py={14} textAlign="center">
            <Text fontSize="sm" fontWeight="medium" color="text">
              Nobody else on the roster
            </Text>
            <Text fontSize="sm" color="gray.500" maxW="320px">
              Assign staff to this event, then you can start a DM here.
            </Text>
          </VStack>
        ) : null}

        {candidates.length > 0 ? (
          <VStack align="stretch" gap={0} divideY="1px" divideColor="cardBorder">
            {candidates.map((row) => {
              const label = row.email ?? row.roleName ?? "Teammate";
              const busy = openingUserId === row.userId;
              const disabled = openingUserId != null;
              return (
                <Box
                  key={row.userId}
                  as="button"
                  w="100%"
                  textAlign="left"
                  px={{ base: 4, md: 5 }}
                  py={3.5}
                  cursor={disabled ? "default" : "pointer"}
                  opacity={disabled && !busy ? 0.6 : 1}
                  _hover={disabled ? undefined : { bg: "bg" }}
                  transition="background 0.12s ease"
                  onClick={() => {
                    if (disabled) return;
                    void onPick(row.userId, label);
                  }}
                >
                  <HStack gap={3} align="center">
                    <ChatAvatar label={label} />
                    <Box minW={0} flex={1}>
                      <Text
                        fontSize="sm"
                        fontWeight="medium"
                        color="text"
                        truncate
                      >
                        {label}
                      </Text>
                      {row.roleName ? (
                        <Text fontSize="xs" color="gray.500" mt={0.5}>
                          {row.roleName}
                        </Text>
                      ) : null}
                    </Box>
                    {busy ? (
                      <Text fontSize="xs" color="gray.500" flexShrink={0}>
                        Opening…
                      </Text>
                    ) : (
                      <Text fontSize="xs" color="gray.500" flexShrink={0}>
                        Message
                      </Text>
                    )}
                  </HStack>
                </Box>
              );
            })}
          </VStack>
        ) : null}
      </Box>
    </VStack>
  );
}
