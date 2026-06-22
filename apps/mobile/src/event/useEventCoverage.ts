import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { fetchAuthSession } from "aws-amplify/auth";

import type { RoomCoverage, ZoneCoverage } from "@av/store";
import {
  fetchRoomCoverage,
  fetchZoneCoverage,
  removeRoomCoverage,
  removeZoneCoverage,
} from "@av/store";
import type { CoverageTarget } from "../AssignCoverageModal";
import {
  apiErrorMessage,
  mergeCoverageRow,
  type RemovingCoverage,
} from "./eventHelpers";

type EventShape = {
  zones: Array<{ id: string; name: string }>;
  rooms: Array<{ id: string; name: string; zoneId: string | null }>;
};

export function useEventCoverage(eventId: string, event: EventShape | undefined) {
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
  const [coverageLoading, setCoverageLoading] = useState(false);

  const loadCoverage = useCallback(async () => {
    if (!event) return;
    if (event.zones.length === 0 && event.rooms.length === 0) {
      setZoneCoverage({});
      setRoomCoverage({});
      return;
    }

    setCoverageLoading(true);
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

      setZoneCoverage(zones);
      setRoomCoverage(rooms);
    } catch (err) {
      console.error("Failed to load coverage:", err);
    } finally {
      setCoverageLoading(false);
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

  useFocusEffect(
    useCallback(() => {
      if (!event) return;
      void loadCoverage();
    }, [event, loadCoverage]),
  );

  return {
    coverageTarget,
    setCoverageTarget,
    roomCoverage,
    zoneCoverage,
    removingCoverage,
    coverageActionError,
    coverageLoading,
    loadCoverage,
    handleCoverageAssigned,
    handleRemoveCoverage,
    openCoverageModal: setCoverageTarget,
    closeCoverageModal: () => setCoverageTarget(null),
  };
}
