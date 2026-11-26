import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AppState, Pressable } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { fetchAuthSession } from "aws-amplify/auth";

import type { EventAlertListItem, EventAlertListResponse } from "@av/store";
import { resolveEventAlert } from "@av/store";

import { BaseButton } from "../../components/BaseButton";
import { BaseCard } from "../../components/BaseCard";
import { BasePill } from "../../components/BasePill";
import { HStack, Text, VStack } from "../../components/ui/layout";
import { useThemeColors } from "../../hooks/useThemeColors";
import type { RoomDetailParams } from "../navigation/types";
import {
  fetchAndSyncEventAlerts,
  getCachedEventAlerts,
  publishAlertBadgeCount,
  subscribeAlertList,
} from "../lib/alerts/alertBadgeCount";
import {
  formatAlertAge,
  priorityLabel,
  severityAccent,
  severityFromPriority,
  severityPillVariant,
} from "./alertBoardUi";

type ListFilter = "active" | "pending" | "all";

type Nav = NativeStackNavigationProp<{ roomDetail: RoomDetailParams }>;

const LIST_POLL_MS = 5_000;

const EMPTY_COUNTS = {
  active: 0,
  pending: 0,
  urgent: 0,
  resolved: 0,
  all: 0,
};

function isActiveAlert(alert: EventAlertListItem): boolean {
  return alert.status === "OPEN" || alert.status === "ACKNOWLEDGED";
}

function alertMeta(alert: EventAlertListItem): string {
  const parts: string[] = [];
  if (alert.status === "RESOLVED") {
    parts.push("Resolved");
    const resolvedAge = formatAlertAge(alert.resolvedAt);
    if (resolvedAge) parts.push(resolvedAge);
  } else {
    const age = formatAlertAge(alert.createdAt);
    if (age) parts.push(age);
  }
  return parts.join(" · ");
}

function applyListData(
  data: EventAlertListResponse,
  setAlerts: (rows: EventAlertListItem[]) => void,
  setCounts: (counts: typeof EMPTY_COUNTS) => void,
) {
  setAlerts(data.alerts);
  setCounts({
    active: data.counts.active ?? 0,
    pending: data.counts.pending ?? 0,
    urgent: data.counts.urgent ?? 0,
    resolved: data.counts.resolved ?? 0,
    all: data.counts.all ?? data.alerts.length,
  });
}

/** Alert-centric list for the Alerts tab (Active / Pending / All). */
export function EventAlertList({
  workspaceId,
  eventId,
  enabled = true,
}: {
  workspaceId: string;
  eventId: string;
  enabled?: boolean;
}) {
  const navigation = useNavigation<Nav>();
  const { muted, text, border } = useThemeColors();

  const cached = getCachedEventAlerts(eventId);
  const [alerts, setAlerts] = useState<EventAlertListItem[]>(
    () => cached?.alerts ?? [],
  );
  const [counts, setCounts] = useState(() =>
    cached?.counts
      ? {
          active: cached.counts.active ?? 0,
          pending: cached.counts.pending ?? 0,
          urgent: cached.counts.urgent ?? 0,
          resolved: cached.counts.resolved ?? 0,
          all: cached.counts.all ?? cached.alerts.length,
        }
      : EMPTY_COUNTS,
  );
  const [status, setStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >(cached ? "succeeded" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ListFilter>("active");
  const [isFocused, setIsFocused] = useState(false);
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);

  const loadAlerts = useCallback(
    async (opts?: { quiet?: boolean }) => {
      if (!opts?.quiet) setStatus("loading");
      setError(null);
      try {
        const data = await fetchAndSyncEventAlerts(eventId);
        if (!data) throw new Error("Not signed in");
        applyListData(data, setAlerts, setCounts);
        setStatus("succeeded");
      } catch (err) {
        console.error("Failed to load event alerts:", err);
        setStatus("failed");
        setError(
          err instanceof Error ? err.message : "Could not load alerts",
        );
      }
    },
    [eventId],
  );

  // Background badge polls update this list even while another tab is focused.
  useEffect(() => {
    if (!enabled) return;
    return subscribeAlertList((syncedEventId, data) => {
      if (syncedEventId !== eventId) return;
      applyListData(data, setAlerts, setCounts);
      setStatus("succeeded");
      setError(null);
    });
  }, [enabled, eventId]);

  useFocusEffect(
    useCallback(() => {
      if (!enabled) {
        setIsFocused(false);
        return;
      }
      setIsFocused(true);
      const hasCache = getCachedEventAlerts(eventId) != null;
      void loadAlerts({ quiet: hasCache });
      return () => setIsFocused(false);
    }, [enabled, eventId, loadAlerts]),
  );

  useEffect(() => {
    if (!enabled || !isFocused) return;

    const poll = setInterval(() => {
      void loadAlerts({ quiet: true });
    }, LIST_POLL_MS);

    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") void loadAlerts({ quiet: true });
    });

    return () => {
      clearInterval(poll);
      if (sub && typeof sub.remove === "function") sub.remove();
    };
  }, [enabled, isFocused, loadAlerts]);

  const filteredAlerts = useMemo(() => {
    if (filter === "active") return alerts.filter(isActiveAlert);
    if (filter === "pending") {
      return alerts.filter(
        (alert) => isActiveAlert(alert) && alert.priority === "MEDIUM",
      );
    }
    return alerts;
  }, [alerts, filter]);

  const handleResolve = useCallback(
    async (alertId: string) => {
      const previous = alerts;
      const previousCounts = counts;
      const target = alerts.find((row) => row.id === alertId);
      if (!target || !isActiveAlert(target)) return;

      setResolvingAlertId(alertId);
      setError(null);

      const remainingActive = alerts.filter(
        (row) => row.id !== alertId && isActiveAlert(row),
      );
      const optimisticResolved: EventAlertListItem = {
        ...target,
        status: "RESOLVED",
        resolvedAt: new Date().toISOString(),
      };
      const nextAlerts = sortClientAlerts([
        ...remainingActive,
        optimisticResolved,
        ...alerts.filter(
          (row) => row.id !== alertId && row.status === "RESOLVED",
        ),
      ]);
      const nextActive = remainingActive.length;
      setAlerts(nextAlerts);
      setCounts({
        active: nextActive,
        pending: remainingActive.filter((row) => row.priority === "MEDIUM")
          .length,
        urgent: remainingActive.filter((row) => row.priority === "HIGH")
          .length,
        resolved: previousCounts.resolved + 1,
        all: remainingActive.length + previousCounts.resolved + 1,
      });
      // Bumps localEpoch so in-flight badge/list polls cannot revive the count.
      publishAlertBadgeCount(nextActive);

      try {
        const session = await fetchAuthSession();
        const token = session.tokens?.idToken?.toString();
        if (!token) throw new Error("Not signed in");
        await resolveEventAlert(token, eventId, alertId);
        void loadAlerts({ quiet: true });
      } catch (err) {
        setAlerts(previous);
        setCounts(previousCounts);
        publishAlertBadgeCount(previousCounts.active);
        setError(
          err instanceof Error ? err.message : "Could not resolve alert",
        );
      } finally {
        setResolvingAlertId(null);
      }
    },
    [alerts, counts, eventId, loadAlerts],
  );

  return (
    <BaseCard title="Alerts" titleAlign="start" variant="elevated">
      <Text fontSize="sm" color={muted} mb={3}>
        Active requests across rooms. Resolve here or open a room for details.
      </Text>

      <HStack space={2} flexWrap="wrap" mb={3}>
        {(
          [
            ["active", `Active (${counts.active})`],
            ["pending", `Pending (${counts.pending})`],
            ["all", `All (${counts.all})`],
          ] as const
        ).map(([key, label]) => (
          <Pressable key={key} onPress={() => setFilter(key)}>
            <BasePill
              label={label}
              variant={
                filter === key
                  ? key === "pending"
                    ? "warning"
                    : key === "active"
                      ? "danger"
                      : "primary"
                  : "outline"
              }
            />
          </Pressable>
        ))}
      </HStack>

      {status === "loading" && alerts.length === 0 ? (
        <Text fontSize="sm" color={muted}>
          Loading alerts…
        </Text>
      ) : null}

      {status === "failed" && error ? (
        <VStack space={2}>
          <Text fontSize="sm" color="red.500">
            {error}
          </Text>
          <BaseButton
            title="Retry"
            variety="tertiary"
            btnWidth="auto"
            onPress={() => void loadAlerts()}
          />
        </VStack>
      ) : null}

      {status === "succeeded" && filteredAlerts.length === 0 ? (
        <Text fontSize="sm" color={muted}>
          {filter === "pending"
            ? "No when-available requests."
            : filter === "all"
              ? "No alerts yet."
              : "No active requests."}
        </Text>
      ) : null}

      <VStack space={2}>
        {filteredAlerts.map((alert) => {
          const severity = severityFromPriority(alert.priority);
          const active = isActiveAlert(alert);
          const zone = alert.zoneName ?? "No zone";
          return (
            <VStack
              key={alert.id}
              space={2}
              borderWidth={1}
              borderColor={border}
              borderRadius="md"
              px={3}
              py={3}
              style={{
                borderLeftWidth: 4,
                borderLeftColor: severityAccent(severity),
                opacity: active ? 1 : 0.72,
              }}
            >
              <HStack
                justifyContent="space-between"
                alignItems="center"
                flexWrap="wrap"
                space={2}
              >
                <Text fontSize="sm" fontWeight="semibold" color={text}>
                  {alert.roomName}
                </Text>
                <BasePill
                  label={active ? priorityLabel(alert.priority) : "Resolved"}
                  variant={active ? severityPillVariant(severity) : "success"}
                />
              </HStack>
              <Text fontSize="xs" color={muted}>
                {zone}
                {alertMeta(alert) ? ` · ${alertMeta(alert)}` : ""}
              </Text>
              <Text fontSize="sm" color={text}>
                {alert.message?.trim() || "No message provided"}
              </Text>
              <HStack space={2} flexWrap="wrap">
                {active ? (
                  <BaseButton
                    title={
                      resolvingAlertId === alert.id ? "Resolving…" : "Resolve"
                    }
                    variety="secondary"
                    btnWidth="auto"
                    isDisabled={resolvingAlertId !== null}
                    onPress={() => void handleResolve(alert.id)}
                  />
                ) : null}
                <BaseButton
                  title="Open room"
                  variety="tertiary"
                  btnWidth="auto"
                  onPress={() =>
                    navigation.navigate("roomDetail", {
                      workspaceId,
                      eventId,
                      roomId: alert.roomId,
                    })
                  }
                />
              </HStack>
            </VStack>
          );
        })}
      </VStack>
    </BaseCard>
  );
}

function sortClientAlerts(
  rows: EventAlertListItem[],
): EventAlertListItem[] {
  return [...rows].sort((a, b) => {
    const aActive = isActiveAlert(a);
    const bActive = isActiveAlert(b);
    if (aActive !== bActive) return aActive ? -1 : 1;
    if (aActive && bActive) {
      const rank = (p: EventAlertListItem["priority"]) =>
        p === "HIGH" ? 0 : 1;
      const byPriority = rank(a.priority) - rank(b.priority);
      if (byPriority !== 0) return byPriority;
      return (
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }
    const aResolved = a.resolvedAt ? new Date(a.resolvedAt).getTime() : 0;
    const bResolved = b.resolvedAt ? new Date(b.resolvedAt).getTime() : 0;
    return bResolved - aResolved;
  });
}
