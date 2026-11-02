import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { fetchAuthSession } from "aws-amplify/auth";

import type { RoomCoverage, ZoneCoverage } from "@av/store";
import {
  fetchRoomCoverage,
  fetchZoneCoverage,
  removeRoomCoverage,
  removeZoneCoverage,
} from "@av/store";
import type { CoverageTarget } from "../screens/zones/AssignCoverageModal";
import {
  apiErrorMessage,
  mergeCoverageRow,
  type RemovingCoverage,
} from "./eventHelpers";

type EventShape = {
  zones: Array<{ id: string; name: string }>;
  rooms: Array<{ id: string; name: string; zoneId: string | null }>;
};

export type EventCoverageScope = {
  /** When set, only these zones are fetched. Omit to fetch all event zones. */
  zoneIds?: string[];
  /** When set, only these rooms are fetched. Omit to fetch all event rooms. */
  roomIds?: string[];
};

export function useEventCoverage(
  eventId: string,
  event: EventShape | undefined,
  scope?: EventCoverageScope,
) {
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
  const [coverageLoadError, setCoverageLoadError] = useState<string | null>(
    null,
  );
  const [coverageLoading, setCoverageLoading] = useState(false);
  const loadGenerationRef = useRef(0);
  const scopeRef = useRef(scope);
  scopeRef.current = scope;

  // "*" = no scope (fetch all). Otherwise a stable sorted id list.
  const zoneIdsKey =
    scope?.zoneIds == null ? "*" : scope.zoneIds.slice().sort().join(",");
  const roomIdsKey =
    scope?.roomIds == null ? "*" : scope.roomIds.slice().sort().join(",");

  const loadCoverage = useCallback(async () => {
    if (!event) return;

    const currentScope = scopeRef.current;
    const zonesToFetch =
      currentScope?.zoneIds != null
        ? event.zones.filter((zone) =>
            currentScope.zoneIds!.includes(zone.id),
          )
        : event.zones;
    const roomsToFetch =
      currentScope?.roomIds != null
        ? event.rooms.filter((room) =>
            currentScope.roomIds!.includes(room.id),
          )
        : event.rooms;

    if (zonesToFetch.length === 0 && roomsToFetch.length === 0) {
      setCoverageLoadError(null);
      setCoverageLoading(false);
      return;
    }

    const generation = ++loadGenerationRef.current;
    setCoverageLoading(true);
    setCoverageLoadError(null);

    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();
      if (!token) {
        if (generation !== loadGenerationRef.current) return;
        setCoverageLoadError("Not signed in.");
        return;
      }

      const [zoneSettled, roomSettled] = await Promise.all([
        Promise.allSettled(
          zonesToFetch.map(async (zone) => {
            const { coverage } = await fetchZoneCoverage(
              token,
              eventId,
              zone.id,
            );
            return [zone.id, coverage] as const;
          }),
        ),
        Promise.allSettled(
          roomsToFetch.map(async (room) => {
            const { coverage } = await fetchRoomCoverage(
              token,
              eventId,
              room.id,
            );
            return [room.id, coverage] as const;
          }),
        ),
      ]);

      if (generation !== loadGenerationRef.current) return;

      const zones: Record<string, ZoneCoverage[]> = {};
      let zoneFailures = 0;
      for (const result of zoneSettled) {
        if (result.status === "fulfilled") {
          const [id, coverage] = result.value;
          zones[id] = coverage;
        } else {
          zoneFailures += 1;
        }
      }

      const rooms: Record<string, RoomCoverage[]> = {};
      let roomFailures = 0;
      for (const result of roomSettled) {
        if (result.status === "fulfilled") {
          const [id, coverage] = result.value;
          rooms[id] = coverage;
        } else {
          roomFailures += 1;
        }
      }

      setZoneCoverage((prev) => ({ ...prev, ...zones }));
      setRoomCoverage((prev) => ({ ...prev, ...rooms }));

      const total = zoneSettled.length + roomSettled.length;
      const failures = zoneFailures + roomFailures;
      if (failures > 0) {
        setCoverageLoadError(
          failures === total
            ? "Could not load coverage. Try again."
            : "Some coverage failed to load. Try again.",
        );
      } else {
        setCoverageLoadError(null);
      }
    } catch (err) {
      console.error("Failed to load coverage:", err);
      if (generation !== loadGenerationRef.current) return;
      setCoverageLoadError(apiErrorMessage(err));
    } finally {
      if (generation === loadGenerationRef.current) {
        setCoverageLoading(false);
      }
    }
  }, [event, eventId, roomIdsKey, zoneIdsKey]);

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

  useFocusEffect(
    useCallback(() => {
      if (!event) return;
      void loadCoverage();
    }, [event, loadCoverage]),
  );

  return {
    roomCoverage,
    zoneCoverage,
    removingCoverage,
    coverageActionError,
    coverageLoadError,
    coverageLoading,
    loadCoverage,
    handleCoverageAssigned,
    handleRemoveCoverage,
  };
}
