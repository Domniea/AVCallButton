import React, { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  Box,
  VStack,
  Text,
  HStack,
  ScrollView,
  useColorModeValue,
  Pressable,
} from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { fetchAuthSession } from "aws-amplify/auth";

import type {
  AppDispatch,
  RootState,
  RosterAssignment,
  RosterPendingInvite,
  RoomCoverage,
  ZoneCoverage,
} from "@av/store";
import {
  clearRoster,
  fetchEventsThunk,
  fetchRosterThunk,
  fetchRoomCoverage,
  fetchZoneCoverage,
  removeRoomCoverage,
  removeZoneCoverage,
} from "@av/store";
import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";
import { BasePill } from "../components/BasePill";
import AssignStaffModal from "./AssignStaffModal";
import AddRoomModal from "./AddRoomModal";
import CreateZoneModal from "./CreateZoneModal";
import AssignCoverageModal, {
  type CoverageTarget,
} from "./AssignCoverageModal";
import type { RootStackParamList } from "./navigation/types";

type EventNav = NativeStackNavigationProp<RootStackParamList, "event">;
type EventRoute = RouteProp<RootStackParamList, "event">;

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  const muted = useColorModeValue("muted", "mutedDark");
  const textColor = useColorModeValue("text", "textDark");

  if (!value) return null;
  return (
    <Box>
      <Text fontSize="xs" color={muted} mb={0.5}>
        {label}
      </Text>
      <Text fontSize="sm" color={textColor}>
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
  const rowBorder = useColorModeValue("cardBorder", "cardBorderDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");

  return (
    <HStack
      justifyContent="space-between"
      alignItems="center"
      space={3}
      py={2}
      px={3}
      borderWidth={1}
      borderColor={rowBorder}
      borderRadius="md"
      bg={surface}
    >
      <Box flex={1}>
        <Text fontSize="sm" color={textColor} numberOfLines={1}>
          {email ?? "—"}
        </Text>
        {subtitle ? (
          <Text fontSize="xs" color={muted}>
            {subtitle}
          </Text>
        ) : null}
      </Box>
      <BasePill label={badge} variant="outline" />
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

function coverageLabel(row: CoverageEntry, roster: RosterAssignment[]) {
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
  const muted = useColorModeValue("muted", "mutedDark");
  const textColor = useColorModeValue("text", "textDark");
  const rowBorder = useColorModeValue("cardBorder", "cardBorderDark");
  const surface = useColorModeValue("surface", "surfaceDark");

  return (
    <Box mt={1}>
      {label ? (
        <Text fontSize="xs" fontWeight="medium" color={muted} mb={1}>
          {label}
        </Text>
      ) : null}
      {rows.length === 0 ? (
        <Text fontSize="xs" color={muted}>
          No coverage assigned yet.
        </Text>
      ) : (
        <VStack space={1}>
          {rows.map((row) => {
            const isRemoving = removingMembershipId === row.membershipId;
            return (
              <HStack
                key={row.id}
                justifyContent="space-between"
                alignItems="center"
                space={2}
                py={1}
                px={2}
                borderWidth={1}
                borderColor={rowBorder}
                borderRadius="md"
                bg={surface}
              >
                <Text fontSize="xs" color={textColor} flex={1} numberOfLines={1}>
                  {coverageLabel(row, roster)}
                </Text>
                {onRemove ? (
                  <BaseButton
                    variety="tertiary"
                    title={isRemoving ? "Removing…" : "Remove"}
                    btnWidth="auto"
                    onPress={() => {
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
  const textColor = useColorModeValue("text", "textDark");
  const rowBorder = useColorModeValue("cardBorder", "cardBorderDark");
  const surface = useColorModeValue("surface", "surfaceDark");

  return (
    <Box
      borderWidth={1}
      borderColor={rowBorder}
      borderRadius="md"
      px={3}
      py={3}
      bg={surface}
    >
      <HStack justifyContent="space-between" alignItems="center" space={2}>
        <Text fontSize="sm" fontWeight="medium" color={textColor} flex={1}>
          {room.name}
        </Text>
        <BaseButton
          variety="tertiary"
          title="Add staff"
          btnWidth="auto"
          onPress={onAddStaff}
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
  const muted = useColorModeValue("muted", "mutedDark");
  const textColor = useColorModeValue("text", "textDark");
  const rowBorder = useColorModeValue("cardBorder", "cardBorderDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const pressedBg = useColorModeValue("blue.50", "whiteAlpha.100");

  const subtitle = [
    roomCount === 1 ? "1 room" : `${roomCount} rooms`,
    coverageCount > 0 ? `${coverageCount} on zone coverage` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Box
      borderWidth={1}
      borderColor={rowBorder}
      borderRadius="md"
      bg={surface}
      overflow="hidden"
    >
      <Pressable
        onPress={onToggle}
        px={3}
        py={3}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        _pressed={{ bg: pressedBg }}
      >
        <HStack justifyContent="space-between" alignItems="center" space={3}>
          <Box flex={1}>
            <Text fontSize="sm" fontWeight="medium" color={textColor} numberOfLines={1}>
              {name}
            </Text>
            <Text fontSize="xs" color={muted}>
              {subtitle || "No rooms yet"}
            </Text>
          </Box>
          <Text fontSize="lg" color={muted}>
            {isExpanded ? "∨" : "›"}
          </Text>
        </HStack>
      </Pressable>
      {isExpanded ? (
        <Box
          px={3}
          pb={3}
          pt={1}
          borderTopWidth={1}
          borderTopColor={rowBorder}
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

export default function EventScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<EventNav>();
  const route = useRoute<EventRoute>();
  const { workspaceId, eventId } = route.params;

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

  const bg = useColorModeValue("bg", "bgDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const muted = useColorModeValue("muted", "mutedDark");
  const textColor = useColorModeValue("text", "textDark");
  const divider = useColorModeValue("cardBorder", "cardBorderDark");

  const rosterMatchesEvent =
    rosterEventId === eventId && rosterFetchStatus === "succeeded";

  const [isAssignStaffOpen, setIsAssignStaffOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isCreateZoneOpen, setIsCreateZoneOpen] = useState(false);
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
    if (authStatus === "unauthenticated") {
      navigation.replace("landing");
    }
  }, [authStatus, navigation]);

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

  useEffect(() => {
    setExpandedZoneIds((prev) =>
      prev.filter((id) => event?.zones.some((zone) => zone.id === id)),
    );
  }, [event?.zones]);

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <Box flex={1} bg={bg} px={6} py={6}>
        <Text color={muted}>Loading…</Text>
      </Box>
    );
  }

  if (!event && eventsFetchStatus === "succeeded") {
    return (
      <Box flex={1} bg={bg} px={6} py={6}>
        <Text color={muted}>Event not found</Text>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box flex={1} bg={bg} px={6} py={6}>
        <Text color={muted}>Loading event…</Text>
      </Box>
    );
  }

  const formattedStart = event.startTime
    ? new Date(event.startTime).toLocaleString()
    : null;
  const formattedEnd = event.endTime
    ? new Date(event.endTime).toLocaleString()
    : null;

  return (
    <Box flex={1} bg={bg}>
      <ScrollView px={6} py={6} contentContainerStyle={{ paddingBottom: 32 }}>
        <VStack space={4} maxW="840" alignSelf="center" w="100%">
          <BaseCard title={event.name} titleAlign="start" variant="elevated">
            <HStack space={2} flexWrap="wrap" mb={2}>
              <BasePill label={event.status} />
              {rosterMatchesEvent && (
                <BasePill
                  label={`${assignments.length} on roster${
                    pendingInvites.length > 0
                      ? ` · ${pendingInvites.length} pending`
                      : ""
                  }`}
                  variant="outline"
                />
              )}
            </HStack>

            <Box borderTopWidth={1} borderTopColor={divider} my={4} />

            <VStack space={6}>
              <VStack space={3}>
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>
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
                    <Text fontSize="sm" color={muted}>
                      No location or schedule set yet.
                    </Text>
                  )}
              </VStack>

              <Box borderTopWidth={1} borderTopColor={divider} pt={4}>
                <VStack space={3}>
                  <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                    Staff
                  </Text>

                  {rosterFetchStatus === "loading" && (
                    <Text fontSize="sm" color={muted}>
                      Loading roster…
                    </Text>
                  )}

                  {rosterFetchStatus === "failed" && rosterFetchError && (
                    <Text fontSize="sm" color="red.500">
                      {rosterFetchError}
                    </Text>
                  )}

                  {rosterMatchesEvent &&
                    assignments.length === 0 &&
                    pendingInvites.length === 0 && (
                      <Text fontSize="sm" color={muted}>
                        No staff on this event yet.
                      </Text>
                    )}

                  {rosterMatchesEvent &&
                    (assignments.length > 0 || pendingInvites.length > 0) && (
                      <VStack space={2}>
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

                  <Box borderTopWidth={1} borderTopColor={divider} pt={4} mt={1}>
                    <BaseButton
                      title="Assign staff"
                      onPress={() => setIsAssignStaffOpen(true)}
                    />
                  </Box>
                </VStack>
              </Box>

              <Box borderTopWidth={1} borderTopColor={divider} pt={4}>
                <VStack space={3}>
                  <HStack justifyContent="space-between" alignItems="center" flexWrap="wrap" space={2}>
                    <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                      Zones & rooms
                    </Text>
                    <HStack space={2}>
                      <BaseButton
                        title="Add room"
                        variety="secondary"
                        btnWidth="auto"
                        onPress={() => setIsAddRoomOpen(true)}
                      />
                      <BaseButton
                        title="Create zone"
                        variety="secondary"
                        btnWidth="auto"
                        onPress={() => setIsCreateZoneOpen(true)}
                      />
                    </HStack>
                  </HStack>

                  {event.zones.length === 0 && event.rooms.length === 0 && (
                    <Text fontSize="sm" color={muted}>
                      No zones or rooms added yet.
                    </Text>
                  )}

                  {coverageActionError ? (
                    <Text fontSize="sm" color="red.500">
                      {coverageActionError}
                    </Text>
                  ) : null}

                  {event.zones.length > 0 && (
                    <VStack space={2}>
                      <Text fontSize="xs" fontWeight="medium" color={muted}>
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
                            <VStack space={3}>
                              <HStack justifyContent="flex-end" alignItems="center" space={2}>
                                <BaseButton
                                  variety="secondary"
                                  title="Add staff"
                                  btnWidth="auto"
                                  onPress={() =>
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
                              <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                                Rooms
                              </Text>
                              {zoneRooms.length === 0 ? (
                                <Text fontSize="sm" color={muted}>
                                  No rooms in this zone yet.
                                </Text>
                              ) : (
                                <VStack space={2}>
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
                      borderColor={divider}
                      borderRadius="md"
                      px={3}
                      py={3}
                      bg={surface}
                    >
                      <Text fontSize="sm" fontWeight="medium" color={textColor} mb={2}>
                        Unassigned rooms
                      </Text>
                      <VStack space={2}>
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
              <BaseButton
            title="Back"
            variety="tertiary"
            btnWidth="auto"
            onPress={() =>
              navigation.navigate("workspace", { workspaceId })
            }
          />
            </VStack>
          </BaseCard>
        </VStack>
      </ScrollView>

      <AssignStaffModal
        isOpen={isAssignStaffOpen}
        eventId={eventId}
        onClose={() => setIsAssignStaffOpen(false)}
      />
      <AddRoomModal
        isOpen={isAddRoomOpen}
        eventId={eventId}
        workspaceId={workspaceId}
        zones={event.zones}
        onClose={() => setIsAddRoomOpen(false)}
      />
      <CreateZoneModal
        isOpen={isCreateZoneOpen}
        eventId={eventId}
        workspaceId={workspaceId}
        rooms={event.rooms}
        onClose={() => setIsCreateZoneOpen(false)}
      />
      <AssignCoverageModal
        isOpen={coverageTarget != null}
        eventId={eventId}
        target={coverageTarget}
        onClose={closeCoverageModal}
        onAssigned={handleCoverageAssigned}
      />
    </Box>
  );
}
