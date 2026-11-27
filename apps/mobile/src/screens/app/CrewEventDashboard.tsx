import React, { useEffect, useMemo } from "react";
import { Box, Text, VStack } from "../../../components/ui/layout";
import { useDispatch, useSelector } from "react-redux";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

import type { AppDispatch, RootState } from "@av/store";
import { clearCrewDashDetail, fetchMyEventDetailThunk } from "@av/store";

import { BaseButton } from "../../../components/BaseButton";
import { BaseCard } from "../../../components/BaseCard";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { EventAlertBoard } from "../../event/EventAlertBoard";
import { OpenAlertsRow } from "../../event/OpenAlertsRow";
import { OverviewPhaseChrome } from "../../event/OverviewPhaseChrome";
import { PostEventSummary } from "../../event/PostEventSummary";
import { resolveEventPhase } from "../../event/eventPhase";
import { useEventPhaseOverride } from "../../hooks/useEventPhaseOverride";
import type { DashStackParamList } from "../../navigation/types";

type CrewEventDashboardRoute = RouteProp<DashStackParamList, "eventHome">;

type CoverageDetail = NonNullable<
  RootState["crewDash"]["eventDetail"]
>;

function CoverageCard({ detail }: { detail: CoverageDetail }) {
  const { muted, text } = useThemeColors();

  return (
    <BaseCard title="Your coverage" titleAlign="start" variant="outline">
      {detail.zones.length === 0 && detail.roomsWithoutZone.length === 0 ? (
        <Text fontSize="sm" color={muted}>
          No zone or room coverage assigned yet.
        </Text>
      ) : (
        <VStack space={3}>
          {detail.zones.map((zone) => (
            <Box key={zone.id}>
              <Text fontSize="sm" fontWeight="semibold" color={text}>
                {zone.name}
              </Text>
              {zone.rooms.length > 0 ? (
                <Text fontSize="xs" color={muted} mt={1}>
                  {zone.rooms.map((room) => room.name).join(" · ")}
                </Text>
              ) : (
                <Text fontSize="xs" color={muted} mt={1}>
                  No rooms in this zone
                </Text>
              )}
            </Box>
          ))}

          {detail.roomsWithoutZone.length > 0 ? (
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color={text}>
                Rooms (no zone)
              </Text>
              <Text fontSize="xs" color={muted} mt={1}>
                {detail.roomsWithoutZone.map((room) => room.name).join(" · ")}
              </Text>
            </Box>
          ) : null}
        </VStack>
      )}
    </BaseCard>
  );
}

/** Crew Overview — phase-aware (pre assignment / live board / post closed). */
export default function CrewEventDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const route = useRoute<CrewEventDashboardRoute>();
  const { workspaceId, eventId } = route.params;
  const { muted } = useThemeColors();
  const { override: phaseOverride } = useEventPhaseOverride();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const detailEventId = useSelector(
    (state: RootState) => state.crewDash.eventId,
  );
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
    if (authStatus !== "authenticated" || !eventId) return;
    void dispatch(fetchMyEventDetailThunk(eventId));
  }, [authStatus, eventId, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearCrewDashDetail());
    };
  }, [dispatch]);

  const coverageFirst = useMemo(() => {
    if (!detailMatchesRoute || !detail) return null;
    return {
      zoneIds: detail.zones.map((zone) => zone.id),
      roomIds: [
        ...detail.zones.flatMap((zone) => zone.rooms.map((room) => room.id)),
        ...detail.roomsWithoutZone.map((room) => room.id),
      ],
    };
  }, [detailMatchesRoute, detail]);

  if (authStatus === "idle" || authStatus === "loading") {
    return <LoadingScreen message="Checking session…" />;
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  const title =
    detailMatchesRoute && detail ? detail.event.name : "Overview";
  const phase =
    detailMatchesRoute && detail
      ? resolveEventPhase(detail.event, phaseOverride)
      : phaseOverride ?? "live";
  const statusLabel =
    detailMatchesRoute && detail ? detail.event.status : "…";

  return (
    <ScreenLayout title={title} maxW="720">
      {detailStatus === "loading" && (
        <Text fontSize="sm" color={muted}>
          Loading your event coverage…
        </Text>
      )}

      {detailStatus === "failed" && detailError && (
        <BaseCard title="Something went wrong" variant="outline">
          <Text color={muted} mb={4}>
            {detailError}
          </Text>
          <BaseButton
            title="Retry"
            onPress={() => void dispatch(fetchMyEventDetailThunk(eventId))}
          />
        </BaseCard>
      )}

      {detailMatchesRoute && detail ? (
        <OverviewPhaseChrome
          status={statusLabel}
          phase={phase}
          hint={detail.assignment.roleName}
          overridden={phaseOverride != null}
        />
      ) : null}

      {phase === "pre" && detailMatchesRoute && detail ? (
        <>
          <BaseCard title="You're on the roster" titleAlign="start" variant="outline">
            <Text fontSize="sm" color={muted} mb={3}>
              This event is still in setup. Review your coverage below — the
              live board unlocks when the show goes active.
            </Text>
          </BaseCard>
          <CoverageCard detail={detail} />
        </>
      ) : null}

      {phase === "live" ? (
        <>
          <OpenAlertsRow subtitle="Active requests for this event" />
          <EventAlertBoard
            workspaceId={workspaceId}
            eventId={eventId}
            enabled={authStatus === "authenticated"}
            coverageFirst={coverageFirst}
          />
        </>
      ) : null}

      {phase === "post" && detailMatchesRoute && detail ? (
        <PostEventSummary
          eventName={detail.event.name}
          cancelled={detail.event.status?.toUpperCase() === "CANCELLED"}
          showMetricsStub={false}
        />
      ) : null}
    </ScreenLayout>
  );
}
