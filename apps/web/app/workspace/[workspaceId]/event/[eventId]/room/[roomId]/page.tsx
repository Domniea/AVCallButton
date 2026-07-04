"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Badge, Box, Grid, HStack, Text, VStack } from "@chakra-ui/react";
import { fetchAuthSession } from "aws-amplify/auth";

import type { AppDispatch, RootState } from "@av/store";
import type { RosterAssignment } from "@av/store";
import {
  fetchEventsThunk,
  fetchRosterThunk,
  fetchRoomCoverage,
  removeRoomCoverage,
  type RoomCoverage,
} from "@av/store";

import AssignCoverageModal, {
  type CoverageTarget,
} from "../../modals/AssignCoverageModal";
import { BaseCard } from "@/components/reusable/BaseCard";
import { BaseButton } from "@/components/reusable/BaseButton";
import { RoomCallLinkActions } from "@/components/reusable/RoomCallLinkActions";

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <Box>
      <Text fontSize="xs" color="gray.500" mb={0.5}>
        {label}
      </Text>
      <Text fontSize="sm" color="text">
        {value?.trim() ? value : "—"}
      </Text>
    </Box>
  );
}

function coverageLabel(row: RoomCoverage, roster: RosterAssignment[]) {
  const rosterEmail = roster.find(
    (assignment) => assignment.membershipId === row.membershipId,
  )?.email;
  const email = row.membership.email ?? rosterEmail ?? "Staff";
  return `${email} · rank ${row.eventRank}`;
}

function apiErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "data" in err.response &&
    err.response.data &&
    typeof err.response.data === "object" &&
    "error" in err.response.data &&
    typeof err.response.data.error === "string"
  ) {
    return err.response.data.error;
  }
  return "Could not update coverage. Try again.";
}

export default function RoomDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const eventId = params.eventId as string;
  const roomId = params.roomId as string;
  const dispatch = useDispatch<AppDispatch>();

  const [coverageRows, setCoverageRows] = useState<RoomCoverage[]>([]);
  const [coverageLoading, setCoverageLoading] = useState(true);
  const [coverageTarget, setCoverageTarget] = useState<CoverageTarget | null>(
    null,
  );
  const [removingMembershipId, setRemovingMembershipId] = useState<
    string | null
  >(null);
  const [coverageActionError, setCoverageActionError] = useState<string | null>(
    null,
  );

  const authStatus = useSelector((state: RootState) => state.auth.status);

  const event = useSelector((state: RootState) =>
    state.events.events.find((entry) => entry.id === eventId),
  );
  const eventsFetchStatus = useSelector(
    (state: RootState) => state.events.fetchStatus,
  );

  const assignments = useSelector(
    (state: RootState) => state.roster.assignments,
  );
  const rosterEventId = useSelector((state: RootState) => state.roster.eventId);
  const rosterFetchStatus = useSelector(
    (state: RootState) => state.roster.fetchStatus,
  );
  const rosterMatchesEvent =
    rosterEventId === eventId && rosterFetchStatus === "succeeded";
  const rosterAutoRetriedRef = useRef(false);

  const room = event?.rooms.find((entry) => entry.id === roomId);
  const zone = room?.zoneId
    ? event?.zones.find((entry) => entry.id === room.zoneId)
    : null;

  const loadCoverage = useCallback(async () => {
    setCoverageLoading(true);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) return;
      const { coverage } = await fetchRoomCoverage(token, eventId, roomId);
      setCoverageRows(coverage);
    } catch (err) {
      console.error("Failed to load room coverage:", err);
    } finally {
      setCoverageLoading(false);
    }
  }, [eventId, roomId]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (eventsFetchStatus === "idle") {
      void dispatch(fetchEventsThunk(workspaceId));
    }
  }, [authStatus, dispatch, eventsFetchStatus, workspaceId]);

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    if (rosterFetchStatus === "idle") {
      void dispatch(fetchRosterThunk(eventId));
    }
  }, [authStatus, dispatch, eventId, rosterFetchStatus]);

  useEffect(() => {
    if (rosterFetchStatus !== "failed" || rosterAutoRetriedRef.current) return;
    rosterAutoRetriedRef.current = true;
    void dispatch(fetchRosterThunk(eventId));
  }, [dispatch, eventId, rosterFetchStatus]);

  useEffect(() => {
    if (!room) return;
    void loadCoverage();
  }, [loadCoverage, room]);

  const handleRemoveCoverage = useCallback(
    async (membershipId: string) => {
      setCoverageActionError(null);
      setRemovingMembershipId(membershipId);
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) return;
        await removeRoomCoverage(token, eventId, roomId, membershipId);
        setCoverageRows((prev) =>
          prev.filter((row) => row.membershipId !== membershipId),
        );
      } catch (err) {
        setCoverageActionError(apiErrorMessage(err));
      } finally {
        setRemovingMembershipId(null);
      }
    },
    [eventId, roomId],
  );

  const handleCoverageAssigned = useCallback(() => {
    void loadCoverage();
    setCoverageTarget(null);
  }, [loadCoverage]);

  const loadingShell = (message: string) => (
    <Box minHeight="100vh" bg="bg" px={6} py={10}>
      <Text color="gray.500">{message}</Text>
    </Box>
  );

  if (authStatus === "idle" || authStatus === "loading") {
    return loadingShell("Loading…");
  }

  if (!event && eventsFetchStatus === "succeeded") {
    return loadingShell("Event not found");
  }

  if (!event) {
    return loadingShell("Loading event…");
  }

  if (!room) {
    return (
      <Box minHeight="100vh" bg="bg" px={6} py={10}>
        <VStack align="stretch" maxW="720px" mx="auto" gap={4}>
          <Text color="gray.500">Room not found.</Text>
          <BaseButton
            variety="tertiary"
            title="Back to event"
            btnWidth="auto"
            onClick={() =>
              router.push(`/workspace/${workspaceId}/event/${eventId}`)
            }
          />
        </VStack>
      </Box>
    );
  }

  const roster = rosterMatchesEvent ? assignments : [];
  const roomTarget: CoverageTarget = {
    kind: "room",
    id: room.id,
    name: room.name,
  };

  return (
    <Box minHeight="100vh" bg="bg" px={6} py={10}>
      <VStack align="stretch" maxW="960px" mx="auto" gap={6}>
        <AssignCoverageModal
          isOpen={coverageTarget != null}
          target={coverageTarget}
          onClose={() => setCoverageTarget(null)}
          onAssigned={handleCoverageAssigned}
        />

        <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
          <BaseButton
            variety="tertiary"
            title="← Back to event"
            btnWidth="auto"
            onClick={() =>
              router.push(`/workspace/${workspaceId}/event/${eventId}`)
            }
          />
          <Text fontSize="sm" color="gray.500">
            <Link
              href={`/workspace/${workspaceId}/event/${eventId}`}
              style={{ textDecoration: "underline" }}
            >
              {event.name}
            </Link>
            {zone ? ` · ${zone.name}` : ""}
          </Text>
        </HStack>

        <BaseCard title={room.name} titleAlign="start" variant="elevated">
          <HStack flexWrap="wrap" gap={2}>
            <Badge variant="outline" colorPalette="gray">
              {event.name}
            </Badge>
            {zone ? (
              <Badge variant="outline" colorPalette="gray">
                {zone.name}
              </Badge>
            ) : (
              <Badge variant="outline" colorPalette="gray">
                Unassigned zone
              </Badge>
            )}
          </HStack>
        </BaseCard>

        {coverageActionError ? (
          <Text fontSize="sm" color="red.500">
            {coverageActionError}
          </Text>
        ) : null}

        <Grid
          w="100%"
          gap={6}
          alignItems="stretch"
          templateColumns={{ base: "1fr", lg: "repeat(2, minmax(0, 1fr))" }}
        >
          <BaseCard title="Room details" titleAlign="start" variant="elevated">
            <VStack align="stretch" gap={4}>
              <DetailRow label="Room name" value={room.name} />
              <DetailRow label="Zone" value={zone?.name ?? "Unassigned"} />
              <Box>
                <Text fontSize="xs" color="gray.500" mb={0.5}>
                  Description
                </Text>
                <Text fontSize="sm" color="gray.500">
                  No description yet. Room notes and setup details will live
                  here.
                </Text>
              </Box>
            </VStack>
          </BaseCard>

          <BaseCard
            title="Guest help link"
            titleAlign="start"
            variant="elevated"
          >
            <VStack align="stretch" gap={3}>
              <Text fontSize="sm" color="gray.500">
                Share, print, or post this link so guests can request AV help
                from this room.
              </Text>
              <RoomCallLinkActions
                roomName={room.name}
                callToken={room.callToken}
                eventName={event.name}
                zoneName={zone?.name}
                expanded
              />
            </VStack>
          </BaseCard>

          <BaseCard title="Room coverage" titleAlign="start" variant="elevated">
            <VStack align="stretch" gap={3}>
              <HStack justify="space-between" align="center">
                <Text fontSize="sm" color="gray.500">
                  Crew notified for help requests in this room.
                </Text>
                <BaseButton
                  variety="tertiary"
                  title="Add staff"
                  btnWidth="auto"
                  onClick={() => setCoverageTarget(roomTarget)}
                />
              </HStack>
              {coverageLoading ? (
                <Text fontSize="sm" color="gray.500">
                  Loading coverage…
                </Text>
              ) : coverageRows.length === 0 ? (
                <Text fontSize="sm" color="gray.500">
                  No coverage assigned yet.
                </Text>
              ) : (
                <VStack align="stretch" gap={2}>
                  {coverageRows.map((row) => {
                    const isRemoving = removingMembershipId === row.membershipId;
                    return (
                      <HStack
                        key={row.id}
                        justify="space-between"
                        align="center"
                        gap={2}
                        py={2}
                        px={3}
                        borderWidth={1}
                        borderColor="cardBorder"
                        borderRadius="md"
                        bg="surface"
                      >
                        <Text fontSize="sm" color="text" flex={1} truncate>
                          {coverageLabel(row, roster)}
                        </Text>
                        <BaseButton
                          variety="tertiary"
                          title={isRemoving ? "Removing…" : "Remove"}
                          btnWidth="auto"
                          disabled={isRemoving}
                          onClick={() =>
                            void handleRemoveCoverage(row.membershipId)
                          }
                        />
                      </HStack>
                    );
                  })}
                </VStack>
              )}
            </VStack>
          </BaseCard>

          <BaseCard
            title="Documents & schematics"
            titleAlign="start"
            variant="elevated"
          >
            <Text fontSize="sm" color="gray.500">
              Upload floor plans, rack diagrams, and other reference files for
              this room. File storage is coming soon.
            </Text>
          </BaseCard>

          <BaseCard
            title="Physical call button"
            titleAlign="start"
            variant="elevated"
          >
            <Text fontSize="sm" color="gray.500">
              Download device config and sideload instructions for in-room
              hardware buttons. Coming soon.
            </Text>
          </BaseCard>
        </Grid>
      </VStack>
    </Box>
  );
}
