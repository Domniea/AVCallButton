import React from "react";
import { HStack } from "../../../components/ui/layout";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { BaseButton } from "../../../components/BaseButton";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { EventAlertBoard } from "../../event/EventAlertBoard";
import { LeadSetupChecklist } from "../../event/LeadSetupChecklist";
import { OpenAlertsRow } from "../../event/OpenAlertsRow";
import { OverviewPhaseChrome } from "../../event/OverviewPhaseChrome";
import { PostEventSummary } from "../../event/PostEventSummary";
import { resolveEventPhase } from "../../event/eventPhase";
import { unassignedRooms } from "../../event/eventHelpers";
import { useEventPhaseOverride } from "../../hooks/useEventPhaseOverride";
import { useEventScreenData } from "../../event/useEventScreenData";
import type { DashStackParamList } from "../../navigation/types";

type EventDashboardNav = NativeStackNavigationProp<
  DashStackParamList,
  "eventHome"
>;
type EventDashboardRoute = RouteProp<DashStackParamList, "eventHome">;

/** Lead Overview — content switches by event phase (pre / live / post). */
export default function EventDashboard() {
  const navigation = useNavigation<EventDashboardNav>();
  const route = useRoute<EventDashboardRoute>();
  const { workspaceId, eventId } = route.params;

  const {
    authStatus,
    event,
    eventsFetchStatus,
    assignments,
    pendingInvites,
    rosterMatchesEvent,
  } = useEventScreenData(workspaceId, eventId);
  const { override: phaseOverride } = useEventPhaseOverride();

  if (authStatus === "idle" || authStatus === "loading") {
    return <LoadingScreen message="Checking session…" />;
  }

  if (!event && eventsFetchStatus === "succeeded") {
    return <LoadingScreen message="Event not found" />;
  }

  if (!event) {
    return <LoadingScreen message="Loading event…" />;
  }

  const phase = resolveEventPhase(event, phaseOverride);
  const unassignedCount = unassignedRooms(event.rooms).length;
  const roomCount = event.rooms.length;
  const zoneCount = event.zones.length;
  const staffCount = rosterMatchesEvent ? assignments.length : 0;
  const pendingCount = rosterMatchesEvent ? pendingInvites.length : 0;

  const structureHint = [
    `${zoneCount} zone${zoneCount === 1 ? "" : "s"}`,
    `${roomCount} room${roomCount === 1 ? "" : "s"}`,
    unassignedCount > 0 ? `${unassignedCount} unassigned` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const goZones = () =>
    navigation.navigate("eventZones", { workspaceId, eventId });
  const goStaff = () =>
    navigation.navigate("eventStaff", { workspaceId, eventId });

  const setupChecks = [
    {
      id: "spaces",
      title: "Zones & rooms",
      subtitle:
        roomCount > 0
          ? structureHint
          : "Add at least one room (zones optional)",
      done: roomCount > 0,
      onPress: goZones,
    },
    {
      id: "staff",
      title: "Staff on roster",
      subtitle:
        staffCount > 0
          ? `${staffCount} assigned${pendingCount > 0 ? ` · ${pendingCount} pending` : ""}`
          : "Invite or assign crew for this event",
      done: staffCount > 0,
      onPress: goStaff,
    },
    {
      id: "unassigned",
      title: "Room placement",
      subtitle:
        unassignedCount === 0
          ? "All rooms are in a zone (or you have no zones)"
          : `${unassignedCount} room${unassignedCount === 1 ? "" : "s"} not in a zone`,
      done: zoneCount === 0 || unassignedCount === 0,
      onPress: goZones,
    },
  ];

  return (
    <ScreenLayout title={event.name} maxW="720">
      <OverviewPhaseChrome
        status={event.status}
        phase={phase}
        hint={structureHint}
        overridden={phaseOverride != null}
      />

      {phase === "pre" ? (
        <LeadSetupChecklist
          checks={setupChecks}
          onManageZones={goZones}
          onManageStaff={goStaff}
        />
      ) : null}

      {phase === "live" ? (
        <>
          <OpenAlertsRow />
          <EventAlertBoard
            workspaceId={workspaceId}
            eventId={eventId}
            enabled={authStatus === "authenticated"}
          />
          <HStack space={2} flexWrap="wrap">
            <BaseButton
              title="Manage zones"
              variety="tertiary"
              btnWidth="auto"
              onPress={goZones}
            />
            <BaseButton
              title="Manage staff"
              variety="tertiary"
              btnWidth="auto"
              onPress={goStaff}
            />
          </HStack>
        </>
      ) : null}

      {phase === "post" ? (
        <>
          <PostEventSummary
            eventName={event.name}
            cancelled={event.status?.toUpperCase() === "CANCELLED"}
            showMetricsStub
          />
          <EventAlertBoard
            workspaceId={workspaceId}
            eventId={eventId}
            enabled={authStatus === "authenticated"}
          />
        </>
      ) : null}
    </ScreenLayout>
  );
}
