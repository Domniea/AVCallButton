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
  severityAccent,
  severityFromPriority,
  severityLabel,
  severityPillVariant,
  type RoomSeverity,
} from "./alertBoardUi";

type BoardFilter = "all" | RoomSeverity;

type Nav = NativeStackNavigationProp<DashStackParamList>;

/** Quiet poll while the dash is focused (Ably client subscribe deferred — was crashing RN). */
const BOARD_POLL_MS = 5_000;

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

function roomCardSubtitle(room: AlertBoardRoom): string {
  const zone = room.zoneName ?? "No zone";
  const preview = room.drivingAlert?.message?.trim();
  if (preview) return `${zone} · ${preview}`;
  return zone;
}

export function EventAlertBoard({
  workspaceId,
  eventId,
  enabled = true,
}: {
  workspaceId: string;
  eventId: string;
  enabled?: boolean;
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

  return (
    <BaseCard title="Crew Dashboard" titleAlign="start" variant="elevated">
      <Text fontSize="sm" color={muted} mb={3}>
        Rooms by alert status. Open a room to resolve requests.
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
          Loading rooms…
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

      <VStack space={2}>
        {filteredRooms.map((room) => {
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
        })}
      </VStack>
    </BaseCard>
  );
}
