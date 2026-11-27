import React, { useState } from "react";
import { Text, VStack } from "../../../components/ui/layout";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

import { fetchRosterThunk } from "@av/store";

import { BaseButton } from "../../../components/BaseButton";
import { BaseCard } from "../../../components/BaseCard";
import { LoadingScreen } from "../../../components/LoadingScreen";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { useThemeColors } from "../../../hooks/useThemeColors";
import {
  assignmentSubtitle,
  pendingSubtitle,
} from "../../event/eventHelpers";
import { StaffRow } from "../../event/EventUi";
import { useEventScreenData } from "../../event/useEventScreenData";
import type { DashStackParamList } from "../../navigation/types";
import AssignStaffModal from "./AssignStaffModal";

type EventStaffRoute = RouteProp<DashStackParamList, "eventStaff">;

/** Lead setup: roster + assign staff (moved off Overview). */
export default function EventStaffScreen() {
  const route = useRoute<EventStaffRoute>();
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

  const staffSubtitle = rosterMatchesEvent
    ? `${assignments.length} on roster${
        pendingInvites.length > 0 ? ` · ${pendingInvites.length} pending` : ""
      }`
    : "View and assign event staff";

  return (
    <>
      <ScreenLayout
        title="Staff"
        subtitle={event.name}
        showBack
        showMenu={false}
        maxW="720"
      >
        <BaseCard variant="outline">
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

          <BaseButton
            title="Assign staff"
            onPress={() => setIsAssignStaffOpen(true)}
          />
        </BaseCard>
      </ScreenLayout>

      <AssignStaffModal
        isOpen={isAssignStaffOpen}
        eventId={eventId}
        onClose={() => setIsAssignStaffOpen(false)}
      />
    </>
  );
}
