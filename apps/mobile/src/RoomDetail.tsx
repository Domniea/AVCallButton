import React from "react";
import { Text, VStack } from "native-base";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

import { BaseCard } from "../components/BaseCard";
import { LoadingScreen } from "../components/LoadingScreen";
import { RoomCallLinkActions } from "../components/RoomCallLinkActions";
import { ScreenLayout } from "../components/ScreenLayout";
import { useThemeColors } from "../hooks/useThemeColors";
import AssignCoverageModal from "./AssignCoverageModal";
import { CoverageList, DetailRow } from "./event/EventUi";
import { removingMembershipIdFor } from "./event/eventHelpers";
import { useEventCoverage } from "./event/useEventCoverage";
import { useEventScreenData } from "./event/useEventScreenData";
import type { RootStackParamList } from "./navigation/types";

type RoomDetailRoute = RouteProp<RootStackParamList, "roomDetail">;

export default function RoomDetailScreen() {
  const route = useRoute<RoomDetailRoute>();
  const { workspaceId, eventId, roomId } = route.params;
  const { muted } = useThemeColors();

  const {
    authStatus,
    event,
    eventsFetchStatus,
    assignments,
    rosterMatchesEvent,
  } = useEventScreenData(workspaceId, eventId);

  const {
    roomCoverage,
    coverageActionError,
    coverageTarget,
    removingCoverage,
    handleCoverageAssigned,
    handleRemoveCoverage,
    openCoverageModal,
    closeCoverageModal,
  } = useEventCoverage(eventId, event);

  if (authStatus === "idle" || authStatus === "loading") {
    return <LoadingScreen message="Checking session…" />;
  }

  if (!event && eventsFetchStatus === "succeeded") {
    return <LoadingScreen message="Event not found" />;
  }

  if (!event) {
    return <LoadingScreen message="Loading event…" />;
  }

  const room = event.rooms.find((r) => r.id === roomId);
  if (!room) {
    return (
      <ScreenLayout title="Room not found" maxW="720">
        <Text fontSize="sm" color={muted}>
          This room may have been removed.
        </Text>
      </ScreenLayout>
    );
  }

  const zone = room.zoneId
    ? event.zones.find((z) => z.id === room.zoneId)
    : null;
  const roster = rosterMatchesEvent ? assignments : [];
  const roomTarget = { kind: "room" as const, id: room.id, name: room.name };
  const subtitle = zone ? `${event.name} · ${zone.name}` : `${event.name} · Unassigned`;

  return (
    <>
      <ScreenLayout title={room.name} subtitle={subtitle} maxW="720">
        {coverageActionError ? (
          <Text fontSize="sm" color="red.500">
            {coverageActionError}
          </Text>
        ) : null}

        <BaseCard title="Room details" titleAlign="start" variant="outline">
          <VStack space={3}>
            <DetailRow label="Room name" value={room.name} />
            <DetailRow label="Zone" value={zone?.name ?? "Unassigned"} />
          </VStack>
        </BaseCard>

        <BaseCard title="Guest help link" titleAlign="start" variant="outline">
          <RoomCallLinkActions
            roomName={room.name}
            callToken={room.callToken}
            eventName={event.name}
            zoneName={zone?.name}
          />
        </BaseCard>

        <BaseCard variant="outline">
          <CoverageList
            rows={roomCoverage[room.id] ?? []}
            roster={roster}
            label="Room coverage"
            onAdd={() => openCoverageModal(roomTarget)}
            onRemove={(membershipId) =>
              void handleRemoveCoverage(roomTarget, membershipId)
            }
            removingMembershipId={removingMembershipIdFor(
              removingCoverage,
              "room",
              room.id,
            )}
          />
        </BaseCard>
      </ScreenLayout>

      <AssignCoverageModal
        isOpen={coverageTarget != null}
        eventId={eventId}
        target={coverageTarget}
        onClose={closeCoverageModal}
        onAssigned={handleCoverageAssigned}
      />
    </>
  );
}
