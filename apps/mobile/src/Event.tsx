import React, { useState } from "react";
import { VStack, Text, HStack } from "native-base";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

import { fetchRosterThunk } from "@av/store";
import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";
import { BasePill } from "../components/BasePill";
import { ListRow } from "../components/ListRow";
import { LoadingScreen } from "../components/LoadingScreen";
import { ScreenLayout } from "../components/ScreenLayout";
import { SectionHeader } from "../components/SectionHeader";
import { useThemeColors } from "../hooks/useThemeColors";
import AssignStaffModal from "./AssignStaffModal";
import {
  assignmentSubtitle,
  pendingSubtitle,
  unassignedRooms,
} from "./event/eventHelpers";
import { DetailRow, StaffRow } from "./event/EventUi";
import { useEventScreenData } from "./event/useEventScreenData";
import type { RootStackParamList } from "./navigation/types";

type EventNav = NativeStackNavigationProp<RootStackParamList, "event">;
type EventRoute = RouteProp<RootStackParamList, "event">;

export default function EventScreen() {
  const navigation = useNavigation<EventNav>();
  const route = useRoute<EventRoute>();
  const { workspaceId, eventId } = route.params;
  const { muted } = useThemeColors();
  const [isAssignStaffOpen, setIsAssignStaffOpen] = useState(false);

  const {
    authStatus,
    event,
    eventsFetchStatus,
    assignments,
    pendingInvites,
    rosterMatchesEvent,
    rosterFetchStatus,
    rosterFetchError,
    dispatch,
  } = useEventScreenData(workspaceId, eventId);

  if (authStatus === "idle" || authStatus === "loading") {
    return <LoadingScreen message="Checking session…" />;
  }

  if (!event && eventsFetchStatus === "succeeded") {
    return <LoadingScreen message="Event not found" />;
  }

  if (!event) {
    return <LoadingScreen message="Loading event…" />;
  }

  const formattedStart = event.startTime
    ? new Date(event.startTime).toLocaleString()
    : null;
  const formattedEnd = event.endTime
    ? new Date(event.endTime).toLocaleString()
    : null;

  const unassignedCount = unassignedRooms(event.rooms).length;
  const zonesSubtitle = [
    `${event.zones.length} zone${event.zones.length === 1 ? "" : "s"}`,
    `${event.rooms.length} room${event.rooms.length === 1 ? "" : "s"}`,
    unassignedCount > 0
      ? `${unassignedCount} unassigned`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const staffSubtitle = rosterMatchesEvent
    ? `${assignments.length} on roster${
        pendingInvites.length > 0
          ? ` · ${pendingInvites.length} pending`
          : ""
      }`
    : "View and assign event staff";

  return (
    <>
      <ScreenLayout title={event.name} maxW="720">
        <HStack space={2} flexWrap="wrap">
          <BasePill label={event.status} variant="primary" />
          {rosterMatchesEvent && assignments.length > 0 ? (
            <BasePill
              label={`${assignments.length} staff`}
              variant="outline"
            />
          ) : null}
        </HStack>

        <BaseCard variant="outline">
          <SectionHeader>Event details</SectionHeader>
          <VStack space={3}>
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
        </BaseCard>

        <VStack space={3}>
          <SectionHeader>Manage</SectionHeader>
          <ListRow
            title="Zones & rooms"
            subtitle={zonesSubtitle}
            meta="Coverage by zone and room"
            onPress={() =>
              navigation.navigate("eventZones", { workspaceId, eventId })
            }
          />
        </VStack>

        <BaseCard variant="outline">
          <SectionHeader>Staff</SectionHeader>
          <Text fontSize="sm" color={muted} mb={3}>
            {staffSubtitle}
          </Text>

          {rosterFetchStatus === "loading" && (
            <Text fontSize="sm" color={muted} mb={3}>
              Loading roster…
            </Text>
          )}

          {rosterFetchStatus === "failed" && rosterFetchError && (
            <VStack space={2} alignItems="flex-start" mb={3}>
              <Text fontSize="sm" color="red.500">
                {rosterFetchError}
              </Text>
              <BaseButton
                title="Retry roster"
                variety="tertiary"
                btnWidth="auto"
                onPress={() => void dispatch(fetchRosterThunk(eventId))}
              />
            </VStack>
          )}

          {rosterMatchesEvent &&
            assignments.length === 0 &&
            pendingInvites.length === 0 && (
              <Text fontSize="sm" color={muted} mb={3}>
                No staff on this event yet.
              </Text>
            )}

          {rosterMatchesEvent &&
            (assignments.length > 0 || pendingInvites.length > 0) && (
              <VStack space={2} mb={3}>
                {assignments.slice(0, 3).map((a) => (
                  <StaffRow
                    key={a.id}
                    email={a.email}
                    subtitle={assignmentSubtitle(a)}
                    badge={a.role ?? "Assigned"}
                  />
                ))}
                {pendingInvites.slice(0, 2).map((p) => (
                  <StaffRow
                    key={p.id}
                    email={p.email}
                    subtitle={pendingSubtitle(p)}
                    badge="Pending"
                  />
                ))}
                {assignments.length + pendingInvites.length > 5 ? (
                  <Text fontSize="xs" color={muted}>
                    +{assignments.length + pendingInvites.length - 5} more on
                    roster
                  </Text>
                ) : null}
              </VStack>
            )}

          <BaseButton
            title="Assign staff"
            onPress={() => setIsAssignStaffOpen(true)}
          />
        </BaseCard>

        <BaseButton
          title="Back to workspace"
          variety="tertiary"
          btnWidth="auto"
          onPress={() => navigation.navigate("workspace", { workspaceId })}
        />
      </ScreenLayout>

      <AssignStaffModal
        isOpen={isAssignStaffOpen}
        eventId={eventId}
        onClose={() => setIsAssignStaffOpen(false)}
      />
    </>
  );
}
