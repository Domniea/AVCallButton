"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Badge, Box, HStack, Text, VStack } from "@chakra-ui/react";
import { fetchAuthSession } from "aws-amplify/auth";
import AssignStaffModal from "./modals/AssignStaffModal";
import AddRoomModal from "./modals/AddRoomModal";
import CreateZoneModal from "./modals/CreateZoneModal";
import AssignCoverageModal, {
  type CoverageTarget,
} from "./modals/AssignCoverageModal";

import type { AppDispatch, RootState } from "@av/store";
import type { RosterAssignment, RosterPendingInvite } from "@av/store";
import {
  clearRoster,
  fetchEventsThunk,
  fetchRosterThunk,
  fetchRoomCoverage,
  fetchZoneCoverage,
  removeRoomCoverage,
  removeZoneCoverage,
  type RoomCoverage,
  type ZoneCoverage,
} from "@av/store";
import { BaseCard } from "@/components/reusable/BaseCard";
import { BaseButton } from "@/components/reusable/BaseButton";

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

function StaffRow({
  email,
  subtitle,
  badge,
}: {
  email: string | null;
  subtitle?: string;
  badge: string;
}) {
  return (
    <HStack
      justify="space-between"
      align="center"
      gap={3}
      py={2}
      px={3}
      borderWidth={1}
      borderColor="cardBorder"
      borderRadius="md"
      bg="surface"
    >
      <Box minW={0} flex={1}>
        <Text fontSize="sm" color="text" truncate>
          {email ?? "—"}
        </Text>
        {subtitle ? (
          <Text fontSize="xs" color="gray.500">
            {subtitle}
          </Text>
        ) : null}
      </Box>
      <Badge size="sm" variant="subtle" flexShrink={0}>
        {badge}
      </Badge>
    </HStack>
  );
}

function assignmentSubtitle(a: RosterAssignment) {
  const parts = [a.roleName, `Event rank ${a.eventRank}`].filter(Boolean);
  return parts.join(" · ");
}

function pendingSubtitle(p: RosterPendingInvite) {
  const parts = [p.roleName, `Event rank ${p.eventRank}`].filter(Boolean);
  return parts.join(" · ");
}

function roomsForZone(
  rooms: Array<{ id: string; name: string; zoneId: string | null }>,
  zoneId: string,
) {
  return rooms.filter((room) => room.zoneId === zoneId);
}

type CoverageEntry = RoomCoverage | ZoneCoverage;

function coverageLabel(
  row: CoverageEntry,
  roster: RosterAssignment[],
) {
  const rosterEmail = roster.find(
    (a) => a.membershipId === row.membershipId,
  )?.email;
  const email = row.membership.email ?? rosterEmail ?? "Staff";
  return `${email} · rank ${row.eventRank}`;
}

function mergeCoverageRow<T extends CoverageEntry>(
  existing: T[],
  row: T,
): T[] {
  if (existing.some((entry) => entry.membershipId === row.membershipId)) {
    return existing;
  }
  return [...existing, row].sort(
    (a, b) =>
      b.eventRank - a.eventRank ||
      String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")),
  );
}

function CoverageList({
  rows,
  roster,
  onRemove,
  removingMembershipId,
  label,
}: {
  rows: CoverageEntry[];
  roster: RosterAssignment[];
  onRemove?: (membershipId: string) => void;
  removingMembershipId?: string | null;
  label?: string;
}) {
  return (
    <Box mt={1}>
      {label ? (
        <Text fontSize="xs" fontWeight="medium" color="gray.500" mb={1}>
          {label}
        </Text>
      ) : null}
      {rows.length === 0 ? (
        <Text fontSize="xs" color="gray.500">
          No coverage assigned yet.
        </Text>
      ) : (
        <VStack align="stretch" gap={1}>
          {rows.map((row) => {
            const isRemoving = removingMembershipId === row.membershipId;
            return (
              <HStack
                key={row.id}
                justify="space-between"
                align="center"
                gap={2}
                py={1}
                px={2}
                borderWidth={1}
                borderColor="cardBorder"
                borderRadius="md"
                bg="surface"
              >
                <Text fontSize="xs" color="text" flex={1} truncate>
                  {coverageLabel(row, roster)}
                </Text>
                {onRemove ? (
                  <BaseButton
                    variety="tertiary"
                    title={isRemoving ? "Removing…" : "Remove"}
                    btnWidth="auto"
                    onClick={() => {
                      if (isRemoving) return;
                      onRemove(row.membershipId);
                    }}
                  />
                ) : null}
              </HStack>
            );
          })}
        </VStack>
      )}
    </Box>
  );
}

function RoomCoverageSection({
  room,
  rows,
  roster,
  onAddStaff,
  onRemove,
  removingMembershipId,
}: {
  room: { id: string; name: string };
  rows: RoomCoverage[];
  roster: RosterAssignment[];
  onAddStaff: () => void;
  onRemove?: (membershipId: string) => void;
  removingMembershipId?: string | null;
}) {
  return (
    <Box
      borderWidth={1}
      borderColor="cardBorder"
      borderRadius="md"
      px={3}
      py={3}
      bg="surface"
    >
      <HStack justify="space-between" align="center" gap={2}>
        <Text fontSize="sm" fontWeight="medium" color="text">
          {room.name}
        </Text>
        <BaseButton
          variety="tertiary"
          title="Add staff"
          btnWidth="auto"
          onClick={onAddStaff}
        />
      </HStack>
      <CoverageList
        rows={rows}
        roster={roster}
        label="Room coverage"
        onRemove={onRemove}
        removingMembershipId={removingMembershipId}
      />
    </Box>
  );
}

type RemovingCoverage = {
  kind: "room" | "zone";
  targetId: string;
  membershipId: string;
};

function removingMembershipIdFor(
  removing: RemovingCoverage | null,
  kind: "room" | "zone",
  targetId: string,
): string | null {
  if (!removing || removing.kind !== kind || removing.targetId !== targetId) {
    return null;
  }
  return removing.membershipId;
}

function ZoneListRow({
  name,
  roomCount,
  coverageCount,
  isExpanded,
  onToggle,
  children,
}: {
  name: string;
  roomCount: number;
  coverageCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  children?: ReactNode;
}) {
  const subtitle = [
    roomCount === 1 ? "1 room" : `${roomCount} rooms`,
    coverageCount > 0 ? `${coverageCount} on zone coverage` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Box
      borderWidth={1}
      borderColor="cardBorder"
      borderRadius="md"
      bg="surface"
      overflow="hidden"
    >
      <Box
        as="button"
        w="100%"
        textAlign="left"
        px={3}
        py={3}
        cursor="pointer"
        _hover={{ bg: "blue.50" }}
        _dark={{ _hover: { bg: "whiteAlpha.100" } }}
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <HStack justify="space-between" align="center" gap={3}>
          <Box minW={0}>
            <Text fontSize="sm" fontWeight="medium" color="text" truncate>
              {name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {subtitle || "No rooms yet"}
            </Text>
          </Box>
          <Text fontSize="lg" color="gray.500" flexShrink={0} aria-hidden>
            {isExpanded ? "∨" : "›"}
          </Text>
        </HStack>
      </Box>
      {isExpanded ? (
        <Box
          px={3}
          pb={3}
          pt={1}
          borderTopWidth={1}
          borderColor="cardBorder"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </Box>
      ) : null}
    </Box>
  );
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

export default function EventPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const eventId = params.eventId as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();
  const [isAssignStaffModalOpen, setIsAssignStaffModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isCreateZoneModalOpen, setIsCreateZoneModalOpen] = useState(false);
  const [coverageTarget, setCoverageTarget] = useState<CoverageTarget | null>(
    null,
  );
  const [roomCoverage, setRoomCoverage] = useState<
    Record<string, RoomCoverage[]>
  >({});
  const [zoneCoverage, setZoneCoverage] = useState<
    Record<string, ZoneCoverage[]>
  >({});
  const [removingCoverage, setRemovingCoverage] =
    useState<RemovingCoverage | null>(null);
  const [coverageActionError, setCoverageActionError] = useState<string | null>(
    null,
  );
  const [expandedZoneIds, setExpandedZoneIds] = useState<string[]>([]);

  const authStatus = useSelector((state: RootState) => state.auth.status);

  const event = useSelector((state: RootState) =>
    state.events.events.find((e) => e.id === eventId),
  );
  const eventsFetchStatus = useSelector(
    (state: RootState) => state.events.fetchStatus,
  );

  const assignments = useSelector(
    (state: RootState) => state.roster.assignments,
  );

  const pendingInvites = useSelector(
    (state: RootState) => state.roster.pendingInvites,
  );

  const rosterEventId = useSelector((state: RootState) => state.roster.eventId);
  const rosterFetchStatus = useSelector(
    (state: RootState) => state.roster.fetchStatus,
  );
  const rosterFetchError = useSelector(
    (state: RootState) => state.roster.fetchError,
  );
  const rosterMatchesEvent =
    rosterEventId === eventId && rosterFetchStatus === "succeeded";

  const openAssignStaffModal = () => {
    setIsAssignStaffModalOpen(true);
  };
  const closeAssignStaffModal = () => {
    setIsAssignStaffModalOpen(false);
  };

  const loadCoverage = useCallback(async () => {
    if (!event) return;
    if (event.zones.length === 0 && event.rooms.length === 0) {
      setZoneCoverage({});
      setRoomCoverage({});
      return;
    }

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) return;

      const [zoneSettled, roomSettled] = await Promise.all([
        Promise.allSettled(
          event.zones.map(async (zone) => {
            const { coverage } = await fetchZoneCoverage(
              token,
              eventId,
              zone.id,
            );
            return [zone.id, coverage] as const;
          }),
        ),
        Promise.allSettled(
          event.rooms.map(async (room) => {
            const { coverage } = await fetchRoomCoverage(
              token,
              eventId,
              room.id,
            );
            return [room.id, coverage] as const;
          }),
        ),
      ]);

      const zones: Record<string, ZoneCoverage[]> = {};
      for (const result of zoneSettled) {
        if (result.status === "fulfilled") {
          const [id, coverage] = result.value;
          zones[id] = coverage;
        }
      }

      const rooms: Record<string, RoomCoverage[]> = {};
      for (const result of roomSettled) {
        if (result.status === "fulfilled") {
          const [id, coverage] = result.value;
          rooms[id] = coverage;
        }
      }

      setZoneCoverage((prev) => ({ ...prev, ...zones }));
      setRoomCoverage((prev) => ({ ...prev, ...rooms }));
    } catch (err) {
      console.error("Failed to load coverage:", err);
    }
  }, [event, eventId]);

  const refreshCoverageForTarget = useCallback(
    async (target: CoverageTarget) => {
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) return;

        if (target.kind === "zone") {
          const { coverage } = await fetchZoneCoverage(
            token,
            eventId,
            target.id,
          );
          setZoneCoverage((prev) => ({ ...prev, [target.id]: coverage }));
        } else {
          const { coverage } = await fetchRoomCoverage(
            token,
            eventId,
            target.id,
          );
          setRoomCoverage((prev) => ({ ...prev, [target.id]: coverage }));
        }
      } catch (err) {
        console.error("Failed to refresh coverage:", err);
      }
    },
    [eventId],
  );

  const handleCoverageAssigned = useCallback(
    (target: CoverageTarget, row: RoomCoverage | ZoneCoverage) => {
      if (target.kind === "zone") {
        setZoneCoverage((prev) => ({
          ...prev,
          [target.id]: mergeCoverageRow(
            prev[target.id] ?? [],
            row as ZoneCoverage,
          ),
        }));
      } else {
        setRoomCoverage((prev) => ({
          ...prev,
          [target.id]: mergeCoverageRow(
            prev[target.id] ?? [],
            row as RoomCoverage,
          ),
        }));
      }
      void refreshCoverageForTarget(target);
    },
    [refreshCoverageForTarget],
  );

  const handleRemoveCoverage = useCallback(
    async (target: CoverageTarget, membershipId: string) => {
      setCoverageActionError(null);
      setRemovingCoverage({
        kind: target.kind,
        targetId: target.id,
        membershipId,
      });
      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) {
          setCoverageActionError("Not signed in.");
          return;
        }

        if (target.kind === "room") {
          await removeRoomCoverage(token, eventId, target.id, membershipId);
          setRoomCoverage((prev) => ({
            ...prev,
            [target.id]: (prev[target.id] ?? []).filter(
              (row) => row.membershipId !== membershipId,
            ),
          }));
        } else {
          await removeZoneCoverage(token, eventId, target.id, membershipId);
          setZoneCoverage((prev) => ({
            ...prev,
            [target.id]: (prev[target.id] ?? []).filter(
              (row) => row.membershipId !== membershipId,
            ),
          }));
        }
      } catch (err: unknown) {
        setCoverageActionError(apiErrorMessage(err));
      } finally {
        setRemovingCoverage(null);
      }
    },
    [eventId],
  );

  const openCoverageModal = (target: CoverageTarget) => {
    setCoverageTarget(target);
  };

  const closeCoverageModal = () => {
    setCoverageTarget(null);
  };

  const toggleZoneExpanded = useCallback((zoneId: string) => {
    setExpandedZoneIds((prev) =>
      prev.includes(zoneId)
        ? prev.filter((id) => id !== zoneId)
        : [...prev, zoneId],
    );
  }, []);

  useEffect(() => {
    setExpandedZoneIds((prev) =>
      prev.filter((id) => event?.zones.some((zone) => zone.id === id)),
    );
  }, [event?.zones]);

  useEffect(() => {
    if (searchParams.get("createZone") === "1") {
      setIsCreateZoneModalOpen(true);
      router.replace(`/workspace/${workspaceId}/event/${eventId}`);
    }
  }, [searchParams, router, workspaceId, eventId]);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/");
    }
  }, [authStatus, router]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !workspaceId) return;
    if (eventsFetchStatus === "idle") {
      void dispatch(fetchEventsThunk(workspaceId));
    }
  }, [authStatus, workspaceId, eventsFetchStatus, dispatch]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !eventId) return;
    void dispatch(fetchRosterThunk(eventId));
    return () => {
      dispatch(clearRoster());
    };
  }, [authStatus, eventId, dispatch]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !event) return;
    void loadCoverage();
  }, [authStatus, event, loadCoverage]);

  const loadingShell = (message: string) => (
    <Box minHeight="100vh" bg="bg" px={6} py={10}>
      <VStack align="stretch" maxW="840px" mx="auto" gap={6}>
        <Text color="gray.500">{message}</Text>
      </VStack>
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

  const formattedStart = event.startTime
    ? new Date(event.startTime).toLocaleString()
    : null;
  const formattedEnd = event.endTime
    ? new Date(event.endTime).toLocaleString()
    : null;

  return (
    <Box minHeight="100vh" bg="bg" px={6} py={10}>
      <VStack align="stretch" maxW="840px" mx="auto" gap={6}>
        <AssignStaffModal
          isOpen={isAssignStaffModalOpen}
          onClose={closeAssignStaffModal}
        />
        <AddRoomModal
          isOpen={isAddRoomModalOpen}
          onClose={() => setIsAddRoomModalOpen(false)}
        />
        <CreateZoneModal
          isOpen={isCreateZoneModalOpen}
          onClose={() => setIsCreateZoneModalOpen(false)}
        />
        <AssignCoverageModal
          isOpen={coverageTarget != null}
          target={coverageTarget}
          onClose={closeCoverageModal}
          onAssigned={handleCoverageAssigned}
        />
        <BaseCard title={event.name} titleAlign="start" variant="elevated">
          <HStack flexWrap="wrap" gap={2} mb={0}>
            <Badge textTransform="capitalize">{event.status}</Badge>
            {rosterMatchesEvent && (
              <Badge variant="outline" colorPalette="gray">
                {assignments.length} on roster
                {pendingInvites.length > 0
                  ? ` · ${pendingInvites.length} pending`
                  : ""}
              </Badge>
            )}
          </HStack>

          <Box
            w="80%"
            mx="auto"
            borderTopWidth="1px"
            borderTopColor="cardBorder"
            my={5}
            aria-hidden
          />

          <Box
            display="grid"
            gridTemplateColumns={{
              base: "1fr",
              md: "minmax(0, 1.15fr) minmax(0, 1fr)",
            }}
            columnGap={{ md: 8 }}
            rowGap={{ base: 6, md: 4 }}
            alignItems="start"
            justifyItems="stretch"
            w="100%"
          >
            <Box minW={0} alignSelf="start">
              <VStack align="stretch" gap={3}>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="text"
                  lineHeight="1.25"
                  m={0}
                >
                  Event details
                </Text>
                <DetailRow label="Location" value={event.location} />
                <DetailRow label="Venue" value={event.venue} />
                <DetailRow label="Starts" value={formattedStart} />
                <DetailRow label="Ends" value={formattedEnd} />
                {!event.location &&
                  !event.venue &&
                  !formattedStart &&
                  !formattedEnd && (
                    <Text fontSize="sm" color="gray.500">
                      No location or schedule set yet.
                    </Text>
                  )}
              </VStack>
            </Box>

            <Box
              minW={0}
              alignSelf="start"
              borderLeftWidth={{ base: "0", md: "1px" }}
              borderTopWidth={{ base: "1px", md: "0" }}
              borderColor="cardBorder"
              pl={{ base: 0, md: 6 }}
              pt={{ base: 4, md: 0 }}
            >
              <VStack align="stretch" gap={3} justify="flex-start">
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="text"
                  lineHeight="1.25"
                  m={0}
                >
                  Staff
                </Text>

                {rosterFetchStatus === "loading" && (
                  <Text fontSize="sm" color="gray.500" m={0}>
                    Loading roster…
                  </Text>
                )}

                {rosterFetchStatus === "failed" && rosterFetchError && (
                  <Text fontSize="sm" color="red.500" m={0}>
                    {rosterFetchError}
                  </Text>
                )}

                {rosterMatchesEvent &&
                  assignments.length === 0 &&
                  pendingInvites.length === 0 && (
                    <Text fontSize="sm" color="gray.500" m={0}>
                      No staff on this event yet.
                    </Text>
                  )}

                {rosterMatchesEvent &&
                  (assignments.length > 0 || pendingInvites.length > 0) && (
                    <VStack align="stretch" gap={2}>
                      {assignments.map((a) => (
                        <StaffRow
                          key={a.id}
                          email={a.email}
                          subtitle={assignmentSubtitle(a)}
                          badge={a.role ?? "Assigned"}
                        />
                      ))}
                      {pendingInvites.map((p) => (
                        <StaffRow
                          key={p.id}
                          email={p.email}
                          subtitle={pendingSubtitle(p)}
                          badge="Pending"
                        />
                      ))}
                    </VStack>
                  )}

                <Box
                  borderTopWidth="1px"
                  borderTopColor="cardBorder"
                  pt={4}
                  mt={1}
                >
                  <BaseButton
                    title="Assign staff"
                    btnWidth="100%"
                    onClick={openAssignStaffModal}
                  />
                </Box>
              </VStack>
            </Box>
          </Box>

          <Box borderTopWidth="1px" borderTopColor="cardBorder" pt={4} mt={4}>
            <VStack align="stretch" gap={3}>
              <HStack justify="space-between" align="center" flexWrap="wrap" gap={2}>
                <Text fontSize="sm" fontWeight="semibold" color="text">
                  Zones & rooms
                </Text>
                <HStack gap={2}>
                  <BaseButton
                    variety="secondary"
                    title="Add room"
                    btnWidth="auto"
                    onClick={() => setIsAddRoomModalOpen(true)}
                  />
                  <BaseButton
                    variety="secondary"
                    title="Create zone"
                    btnWidth="auto"
                    onClick={() => setIsCreateZoneModalOpen(true)}
                  />
                </HStack>
              </HStack>

              {event.zones.length === 0 && event.rooms.length === 0 && (
                <Text fontSize="sm" color="gray.500">
                  No zones or rooms added yet.
                </Text>
              )}

              {coverageActionError ? (
                <Text fontSize="sm" color="red.500">
                  {coverageActionError}
                </Text>
              ) : null}

              {event.zones.length > 0 && (
                <VStack align="stretch" gap={2}>
                  <Text fontSize="xs" fontWeight="medium" color="gray.500">
                    Zones
                  </Text>
                  {event.zones.map((zone) => {
                    const zoneRooms = roomsForZone(event.rooms, zone.id);
                    const isExpanded = expandedZoneIds.includes(zone.id);
                    return (
                      <ZoneListRow
                        key={zone.id}
                        name={zone.name}
                        roomCount={zoneRooms.length}
                        coverageCount={(zoneCoverage[zone.id] ?? []).length}
                        isExpanded={isExpanded}
                        onToggle={() => toggleZoneExpanded(zone.id)}
                      >
                        <VStack align="stretch" gap={3}>
                          <HStack justify="flex-end" align="center" gap={2}>
                            <BaseButton
                              variety="secondary"
                              title="Add staff"
                              btnWidth="auto"
                              onClick={() =>
                                openCoverageModal({
                                  kind: "zone",
                                  id: zone.id,
                                  name: zone.name,
                                })
                              }
                            />
                          </HStack>
                          <CoverageList
                            rows={zoneCoverage[zone.id] ?? []}
                            roster={rosterMatchesEvent ? assignments : []}
                            label="Zone coverage"
                            onRemove={(membershipId) =>
                              void handleRemoveCoverage(
                                {
                                  kind: "zone",
                                  id: zone.id,
                                  name: zone.name,
                                },
                                membershipId,
                              )
                            }
                            removingMembershipId={removingMembershipIdFor(
                              removingCoverage,
                              "zone",
                              zone.id,
                            )}
                          />
                          <Text fontSize="sm" fontWeight="semibold" color="text">
                            Rooms
                          </Text>
                          {zoneRooms.length === 0 ? (
                            <Text fontSize="sm" color="gray.500">
                              No rooms in this zone yet.
                            </Text>
                          ) : (
                            <VStack align="stretch" gap={2}>
                              {zoneRooms.map((room) => (
                                <RoomCoverageSection
                                  key={room.id}
                                  room={room}
                                  rows={roomCoverage[room.id] ?? []}
                                  roster={
                                    rosterMatchesEvent ? assignments : []
                                  }
                                  onAddStaff={() =>
                                    openCoverageModal({
                                      kind: "room",
                                      id: room.id,
                                      name: room.name,
                                    })
                                  }
                                  onRemove={(membershipId) =>
                                    void handleRemoveCoverage(
                                      {
                                        kind: "room",
                                        id: room.id,
                                        name: room.name,
                                      },
                                      membershipId,
                                    )
                                  }
                                  removingMembershipId={removingMembershipIdFor(
                                    removingCoverage,
                                    "room",
                                    room.id,
                                  )}
                                />
                              ))}
                            </VStack>
                          )}
                        </VStack>
                      </ZoneListRow>
                    );
                  })}
                </VStack>
              )}

              {event.rooms.some((room) => room.zoneId == null) && (
                    <Box
                      borderWidth={1}
                      borderColor="cardBorder"
                      borderRadius="md"
                      px={3}
                      py={3}
                      bg="surface"
                    >
                      <Text fontSize="sm" fontWeight="medium" color="text" mb={2}>
                        Unassigned rooms
                      </Text>
                      <VStack align="stretch" gap={2}>
                        {event.rooms
                          .filter((room) => room.zoneId == null)
                          .map((room) => (
                            <RoomCoverageSection
                              key={room.id}
                              room={room}
                              rows={roomCoverage[room.id] ?? []}
                              roster={rosterMatchesEvent ? assignments : []}
                              onAddStaff={() =>
                                openCoverageModal({
                                  kind: "room",
                                  id: room.id,
                                  name: room.name,
                                })
                              }
                              onRemove={(membershipId) =>
                                void handleRemoveCoverage(
                                  {
                                    kind: "room",
                                    id: room.id,
                                    name: room.name,
                                  },
                                  membershipId,
                                )
                              }
                              removingMembershipId={removingMembershipIdFor(
                                removingCoverage,
                                "room",
                                room.id,
                              )}
                            />
                          ))}
                      </VStack>
                    </Box>
                  )}
            </VStack>
          </Box>
        </BaseCard>
        <HStack pt={6} w="50%" justifyContent="center" mx="auto">
          <BaseButton
            variety="tertiary"
            onClick={() => router.push(`/workspace/${workspaceId}`)}
          >
            Back
          </BaseButton>
        </HStack>
      </VStack>
    </Box>
  );
}
