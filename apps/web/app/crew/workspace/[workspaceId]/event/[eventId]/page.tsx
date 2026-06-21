"use client";

import React, { useEffect } from "react";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";

import type { AppDispatch, RootState } from "@av/store";
import {
  clearCrewDashDetail,
  fetchMyEventDetailThunk,
} from "@av/store";
import { BaseButton } from "@/components/reusable/BaseButton";
import { BaseCard } from "@/components/reusable/BaseCard";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;
  return (
    <Box>
      <Text fontSize="xs" color="gray.500" mb={0.5}>
        {label}
      </Text>
      <Text fontSize="sm" color="text">
        {value}
      </Text>
    </Box>
  );
}

function formatDateTime(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString();
}

export default function CrewEventPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const eventId = params.eventId as string;
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const detailEventId = useSelector((state: RootState) => state.crewDash.eventId);
  const detail = useSelector((state: RootState) => state.crewDash.eventDetail);
  const detailStatus = useSelector(
    (state: RootState) => state.crewDash.detailStatus,
  );
  const detailError = useSelector(
    (state: RootState) => state.crewDash.detailError,
  );

  const detailMatchesRoute =
    detailEventId === eventId && detailStatus === "succeeded";

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/auth/login");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !eventId) return;
    void dispatch(fetchMyEventDetailThunk(eventId));
  }, [authStatus, eventId, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearCrewDashDetail());
    };
  }, [dispatch]);

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <Box minHeight="100vh" bg="bg" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">Checking session…</Text>
      </Box>
    );
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  return (
    <Box minHeight="100vh" bg="bg" px={6} py={10}>
      <VStack align="stretch" maxW="720px" mx="auto" gap={4}>
        {detailStatus === "loading" && (
          <Text color="gray.500">Loading your event coverage…</Text>
        )}

        {detailStatus === "failed" && detailError && (
          <BaseCard title="Something went wrong" variant="outline">
            <Text color="gray.500" mb={4}>
              {detailError}
            </Text>
            <BaseButton onClick={() => void dispatch(fetchMyEventDetailThunk(eventId))}>
              Retry
            </BaseButton>
          </BaseCard>
        )}

        {detailMatchesRoute && detail && (
          <>
            <BaseCard title={detail.event.name} titleAlign="start" variant="elevated">
              <HStack flexWrap="wrap" gap={2} mb={4}>
                <Badge textTransform="capitalize">{detail.event.status}</Badge>
                <Badge colorPalette="blue">{detail.assignment.roleName}</Badge>
                <Badge variant="outline">
                  Event rank {detail.assignment.eventRank}
                </Badge>
              </HStack>

              <VStack align="stretch" gap={3}>
                <DetailRow label="Workspace" value={detail.workspace.name} />
                <DetailRow label="Location" value={detail.event.location} />
                <DetailRow label="Venue" value={detail.event.venue} />
                <DetailRow
                  label="Starts"
                  value={formatDateTime(detail.event.startTime)}
                />
                <DetailRow
                  label="Ends"
                  value={formatDateTime(detail.event.endTime)}
                />
              </VStack>
            </BaseCard>

            <BaseCard title="Your coverage" titleAlign="start" variant="elevated">
              {detail.zones.length === 0 &&
              detail.roomsWithoutZone.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                  No zone or room coverage assigned yet.
                </Text>
              ) : (
                <VStack align="stretch" gap={3}>
                  {detail.zones.map((zone) => (
                    <Box
                      key={zone.id}
                      borderWidth={1}
                      borderColor="cardBorder"
                      borderRadius="md"
                      bg="surface"
                      px={3}
                      py={2}
                    >
                      <HStack
                        justify="space-between"
                        align="center"
                        flexWrap="wrap"
                        gap={2}
                      >
                        <Text fontSize="sm" fontWeight="medium" color="text">
                          {zone.name}
                        </Text>
                        <HStack gap={2} flexWrap="wrap">
                          <Badge variant="outline">Rank {zone.eventRank}</Badge>
                          {zone.alertSummary.active > 0 ? (
                            <Badge colorPalette="blue">
                              {zone.alertSummary.active} active alert
                              {zone.alertSummary.active === 1 ? "" : "s"}
                            </Badge>
                          ) : null}
                          {zone.alertSummary.pending > 0 ? (
                            <Badge variant="outline">
                              {zone.alertSummary.pending} pending
                            </Badge>
                          ) : null}
                        </HStack>
                      </HStack>
                      {zone.rooms.length > 0 ? (
                        <VStack align="stretch" gap={1} mt={2}>
                          {zone.rooms.map((room) => (
                            <Text key={room.id} fontSize="xs" color="gray.500">
                              {room.name} · rank {room.eventRank}
                            </Text>
                          ))}
                        </VStack>
                      ) : (
                        <Text fontSize="xs" color="gray.500" mt={2}>
                          No rooms in this zone
                        </Text>
                      )}
                    </Box>
                  ))}

                  {detail.roomsWithoutZone.length > 0 ? (
                    <VStack align="stretch" gap={2}>
                      <Text fontSize="sm" fontWeight="semibold" color="text">
                        Rooms (no zone)
                      </Text>
                      {detail.roomsWithoutZone.map((room) => (
                        <Box
                          key={room.id}
                          borderWidth={1}
                          borderColor="cardBorder"
                          borderRadius="md"
                          bg="surface"
                          px={3}
                          py={2}
                        >
                          <HStack justify="space-between" align="center">
                            <Text fontSize="sm" color="text">
                              {room.name}
                            </Text>
                            <Badge variant="outline">Rank {room.eventRank}</Badge>
                          </HStack>
                        </Box>
                      ))}
                    </VStack>
                  ) : null}
                </VStack>
              )}
            </BaseCard>
          </>
        )}

        <BaseButton
          variety="tertiary"
          onClick={() => router.push(`/crew/workspace/${workspaceId}`)}
        >
          Back to events
        </BaseButton>
      </VStack>
    </Box>
  );
}
