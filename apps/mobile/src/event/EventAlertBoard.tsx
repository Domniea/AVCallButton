import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AppState, Pressable } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { fetchAuthSession } from "aws-amplify/auth";

import type { AlertBoardCounts, AlertBoardRoom } from "@av/store";
import { fetchEventAlertBoard } from "@av/store";

import { BaseButton } from "../../components/BaseButton";
import { BaseCard } from "../../components/BaseCard";
import { BasePill } from "../../components/BasePill";
import { ListRow } from "../../components/ListRow";
import { HStack, Text, VStack } from "../../components/ui/layout";
import { useThemeColors } from "../../hooks/useThemeColors";
import type { DashStackParamList } from "../navigation/types";
import {
  formatAlertAge,
  maxSeverity,
  severityAccent,
  severityFromPriority,
  severityLabel,
  severityPillVariant,
  severityStatusCountLabel,
  type RoomSeverity,
} from "./alertBoardUi";

type BoardFilter = "all" | RoomSeverity;

type Nav = NativeStackNavigationProp<
  Pick<DashStackParamList, "roomDetail" | "zoneDetail">
>;

/** Safety-net poll only — prefer Ably invalidation elsewhere for live updates. */
const BOARD_POLL_MS = 90_000;

export type BoardCoverageFilter = {
  zoneIds: string[];
  roomIds: string[];
};

type ZoneBoardGroup = {
  key: string;
  zoneId: string | null;
  name: string;
  rooms: AlertBoardRoom[];
  severity: RoomSeverity;
  activeAlertCount: number;
};

function roomCardMeta(room: AlertBoardRoom): string {
  const severity = severityFromPriority(room.currentPriority);
  const parts: string[] = [severityLabel(severity)];
  if (room.activeAlertCount > 0) {
    parts.push(
      `${room.activeAlertCount} active request${room.activeAlertCount === 1 ? "" : "s"}`,
    );
  }
  const age = formatAlertAge(room.drivingAlert?.createdAt);
  if (age) parts.push(age);
  return parts.join(" · ");
}

function roomCardSubtitle(room: AlertBoardRoom, hideZone?: boolean): string {
  const preview = room.drivingAlert?.message?.trim();
  if (hideZone) return preview || "No active request";
  const zone = room.zoneName ?? "No zone";
  if (preview) return `${zone} · ${preview}`;
  return zone;
}

function groupRoomsByZone(rooms: AlertBoardRoom[]): ZoneBoardGroup[] {
  const byZone = new Map<string, ZoneBoardGroup>();

  for (const room of rooms) {
    const key = room.zoneId ?? `__room__:${room.id}`;
    const existing = byZone.get(key);
    if (existing) {
      existing.rooms.push(room);
      continue;
    }
    byZone.set(key, {
      key,
      zoneId: room.zoneId,
      name: room.zoneId ? (room.zoneName ?? "Zone") : room.name,
      rooms: [room],
      severity: "clear",
      activeAlertCount: 0,
    });
  }

  const groups = Array.from(byZone.values()).map((group) => {
    const severities = group.rooms.map((room) =>
      severityFromPriority(room.currentPriority),
    );
    const severity = maxSeverity(severities);
    const activeAlertCount = group.rooms.reduce(
      (sum, room) => sum + (room.activeAlertCount ?? 0),
      0,
    );
    return { ...group, severity, activeAlertCount };
  });

  // Urgent zones first, then pending, then clear; name as tiebreak.
  const rank = { urgent: 0, pending: 1, clear: 2 } as const;
  return groups.sort(
    (a, b) =>
      rank[a.severity] - rank[b.severity] || a.name.localeCompare(b.name),
  );
}

function partitionCoverageFirst(
  groups: ZoneBoardGroup[],
  coverage?: BoardCoverageFilter | null,
): { covered: ZoneBoardGroup[]; rest: ZoneBoardGroup[] } {
  if (!coverage) return { covered: [], rest: groups };

  const zoneSet = new Set(coverage.zoneIds);
  const roomSet = new Set(coverage.roomIds);

  const covered: ZoneBoardGroup[] = [];
  const rest: ZoneBoardGroup[] = [];

  for (const group of groups) {
    const isCovered =
      (group.zoneId != null && zoneSet.has(group.zoneId)) ||
      group.rooms.some((room) => roomSet.has(room.id));
    if (isCovered) covered.push(group);
    else rest.push(group);
  }

  return { covered, rest };
}

export function EventAlertBoard({
  workspaceId,
  eventId,
  enabled = true,
  /** When set, covered zones/rooms render first under “Your coverage”. */
  coverageFirst = null,
}: {
  workspaceId: string;
  eventId: string;
  enabled?: boolean;
  coverageFirst?: BoardCoverageFilter | null;
}) {
  const navigation = useNavigation<Nav>();
  const { muted } = useThemeColors();

  const [boardRooms, setBoardRooms] = useState<AlertBoardRoom[]>([]);
  const [boardCounts, setBoardCounts] = useState<AlertBoardCounts>({
    urgent: 0,
    pending: 0,
    clear: 0,
  });
  const [boardStatus, setBoardStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [boardError, setBoardError] = useState<string | null>(null);
  const [filter, setFilter] = useState<BoardFilter>("all");
  const [isFocused, setIsFocused] = useState(false);

  const loadAlertBoard = useCallback(async (opts?: { quiet?: boolean }) => {
    if (!opts?.quiet) {
      setBoardStatus("loading");
    }
    setBoardError(null);
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) throw new Error("Not signed in");
      const data = await fetchEventAlertBoard(token, eventId);
      setBoardRooms(data.rooms);
      setBoardCounts(data.counts);
      setBoardStatus("succeeded");
    } catch (error) {
      setBoardStatus("failed");
      setBoardError(
        error instanceof Error ? error.message : "Could not load alert board",
      );
    }
  }, [eventId]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        setIsFocused(false);
        return;
      }
      setIsFocused(true);
      void loadAlertBoard();
      return () => setIsFocused(false);
    }, [enabled, loadAlertBoard]),
  );

  useEffect(() => {
    if (!enabled || !isFocused) return;

    const poll = setInterval(() => {
      void loadAlertBoard({ quiet: true });
    }, BOARD_POLL_MS);

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void loadAlertBoard({ quiet: true });
      }
    });

    return () => {
      clearInterval(poll);
      if (sub && typeof sub.remove === "function") {
        sub.remove();
      }
    };
  }, [enabled, isFocused, loadAlertBoard]);

  const filteredRooms = useMemo(() => {
    if (filter === "all") return boardRooms;
    return boardRooms.filter(
      (room) => severityFromPriority(room.currentPriority) === filter,
    );
  }, [boardRooms, filter]);

  const hasZones = useMemo(
    () => boardRooms.some((room) => room.zoneId != null),
    [boardRooms],
  );

  const groups = useMemo(
    () => groupRoomsByZone(filteredRooms),
    [filteredRooms],
  );

  const { covered, rest } = useMemo(
    () => partitionCoverageFirst(groups, coverageFirst),
    [groups, coverageFirst],
  );

  const openGroup = (group: ZoneBoardGroup) => {
    if (group.zoneId) {
      navigation.navigate("zoneDetail", {
        workspaceId,
        eventId,
        zoneId: group.zoneId,
      });
      return;
    }
    const room = group.rooms[0];
    if (!room) return;
    navigation.navigate("roomDetail", {
      workspaceId,
      eventId,
      roomId: room.id,
    });
  };

  const renderGroupRow = (group: ZoneBoardGroup) => {
    const isZone = group.zoneId != null;
    const roomCount = group.rooms.length;
    const statusLabel = severityStatusCountLabel(
      group.severity,
      group.activeAlertCount,
    );
    const subtitle = isZone
      ? `${roomCount} room${roomCount === 1 ? "" : "s"}`
      : roomCardSubtitle(group.rooms[0]!, true);

    return (
      <ListRow
        key={group.key}
        title={group.name}
        subtitle={subtitle}
        meta={
          isZone
            ? statusLabel
            : roomCardMeta(group.rooms[0]!)
        }
        accentColor={severityAccent(group.severity)}
        rightElement={
          <BasePill
            label={isZone ? statusLabel : severityLabel(group.severity)}
            variant={severityPillVariant(group.severity)}
          />
        }
        onPress={() => openGroup(group)}
      />
    );
  };

  const renderRoomRow = (room: AlertBoardRoom) => {
    const severity = severityFromPriority(room.currentPriority);
    return (
      <ListRow
        key={room.id}
        title={room.name}
        subtitle={roomCardSubtitle(room)}
        meta={roomCardMeta(room)}
        accentColor={severityAccent(severity)}
        rightElement={
          <BasePill
            label={severityLabel(severity)}
            variant={severityPillVariant(severity)}
          />
        }
        onPress={() =>
          navigation.navigate("roomDetail", {
            workspaceId,
            eventId,
            roomId: room.id,
          })
        }
      />
    );
  };

  const showCoverageSplit = Boolean(coverageFirst) && covered.length > 0;

  return (
    <BaseCard
      title={hasZones ? "Status board" : "Room board"}
      titleAlign="start"
      variant="elevated"
    >
      <Text fontSize="sm" color={muted} mb={3}>
        {hasZones
          ? "Zones by worst room status. Open a zone or room to dig in."
          : "Rooms by alert status. Open a room to resolve requests."}
      </Text>

      <HStack space={2} flexWrap="wrap" mb={3}>
        {(
          [
            ["all", `All (${boardRooms.length})`],
            ["urgent", `Urgent (${boardCounts.urgent})`],
            ["pending", `Pending (${boardCounts.pending})`],
            ["clear", `Clear (${boardCounts.clear})`],
          ] as const
        ).map(([key, label]) => (
          <Pressable key={key} onPress={() => setFilter(key)}>
            <BasePill
              label={label}
              variant={
                filter === key
                  ? key === "urgent"
                    ? "danger"
                    : key === "pending"
                      ? "warning"
                      : key === "clear"
                        ? "success"
                        : "primary"
                  : "outline"
              }
            />
          </Pressable>
        ))}
      </HStack>

      {boardStatus === "loading" && boardRooms.length === 0 ? (
        <Text fontSize="sm" color={muted}>
          Loading board…
        </Text>
      ) : null}

      {boardStatus === "failed" && boardError ? (
        <VStack space={2}>
          <Text fontSize="sm" color="red.500">
            {boardError}
          </Text>
          <BaseButton
            title="Retry board"
            variety="tertiary"
            btnWidth="auto"
            onPress={() => void loadAlertBoard()}
          />
        </VStack>
      ) : null}

      {boardStatus === "succeeded" && filteredRooms.length === 0 ? (
        <Text fontSize="sm" color={muted}>
          No rooms in this filter.
        </Text>
      ) : null}

      {hasZones ? (
        <VStack space={3}>
          {showCoverageSplit ? (
            <>
              <VStack space={2}>
                <Text fontSize="xs" fontWeight="semibold" color={muted}>
                  Your coverage
                </Text>
                {covered.map(renderGroupRow)}
              </VStack>
              {rest.length > 0 ? (
                <VStack space={2}>
                  <Text fontSize="xs" fontWeight="semibold" color={muted}>
                    All areas
                  </Text>
                  {rest.map(renderGroupRow)}
                </VStack>
              ) : null}
            </>
          ) : (
            <VStack space={2}>{groups.map(renderGroupRow)}</VStack>
          )}
        </VStack>
      ) : (
        <VStack space={2}>
          {showCoverageSplit ? (
            <>
              <Text fontSize="xs" fontWeight="semibold" color={muted}>
                Your coverage
              </Text>
              {covered.flatMap((g) => g.rooms).map(renderRoomRow)}
              {rest.length > 0 ? (
                <>
                  <Text fontSize="xs" fontWeight="semibold" color={muted} mt={2}>
                    All rooms
                  </Text>
                  {rest.flatMap((g) => g.rooms).map(renderRoomRow)}
                </>
              ) : null}
            </>
          ) : (
            filteredRooms.map(renderRoomRow)
          )}
        </VStack>
      )}
    </BaseCard>
  );
}
