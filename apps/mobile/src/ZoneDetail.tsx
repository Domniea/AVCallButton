import React from "react";
import { VStack, Text } from "native-base";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

import { BaseCard } from "../components/BaseCard";
import { ListRow } from "../components/ListRow";
import { LoadingScreen } from "../components/LoadingScreen";
import { ScreenLayout } from "../components/ScreenLayout";
import { SectionHeader } from "../components/SectionHeader";
import { useThemeColors } from "../hooks/useThemeColors";
import AssignCoverageModal from "./AssignCoverageModal";
import { CoverageList } from "./event/EventUi";
import { removingMembershipIdFor, roomsForZone } from "./event/eventHelpers";
import { useEventCoverage } from "./event/useEventCoverage";
import { useEventScreenData } from "./event/useEventScreenData";
import type { RootStackParamList } from "./navigation/types";

type ZoneDetailNav = NativeStackNavigationProp<RootStackParamList, "zoneDetail">;
type ZoneDetailRoute = RouteProp<RootStackParamList, "zoneDetail">;

export default function ZoneDetailScreen() {
  const navigation = useNavigation<ZoneDetailNav>();
  const route = useRoute<ZoneDetailRoute>();
  const { workspaceId, eventId, zoneId } = route.params;
  const { muted } = useThemeColors();

  const {
    authStatus,
    event,
    eventsFetchStatus,
    assignments,
    rosterMatchesEvent,
  } = useEventScreenData(workspaceId, eventId);

  const {
    zoneCoverage,
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

  const zone = event.zones.find((z) => z.id === zoneId);
  if (!zone) {
    return (
      <ScreenLayout title="Zone not found" maxW="720">
        <Text fontSize="sm" color={muted}>
          This zone may have been removed.
        </Text>
      </ScreenLayout>
    );
  }

  const zoneRooms = roomsForZone(event.rooms, zone.id);
  const roster = rosterMatchesEvent ? assignments : [];
  const zoneTarget = { kind: "zone" as const, id: zone.id, name: zone.name };

  return (
    <>
      <ScreenLayout title={zone.name} subtitle={event.name} maxW="720">
        {coverageActionError ? (
          <Text fontSize="sm" color="red.500">
            {coverageActionError}
          </Text>
        ) : null}

        <BaseCard variant="outline">
          <CoverageList
            rows={zoneCoverage[zone.id] ?? []}
            roster={roster}
            label="Zone coverage"
            onAdd={() => openCoverageModal(zoneTarget)}
            onRemove={(membershipId) =>
              void handleRemoveCoverage(zoneTarget, membershipId)
            }
            removingMembershipId={removingMembershipIdFor(
              removingCoverage,
              "zone",
              zone.id,
            )}
          />
        </BaseCard>

        <VStack space={3}>
          <SectionHeader>
            {zoneRooms.length === 0 ? "Rooms" : `Rooms (${zoneRooms.length})`}
          </SectionHeader>

          {zoneRooms.length === 0 ? (
            <BaseCard variant="outline">
              <Text fontSize="sm" color={muted}>
                No rooms in this zone yet. Add a room from the zones list.
              </Text>
            </BaseCard>
          ) : (
            zoneRooms.map((room) => {
              const coverageCount = (roomCoverage[room.id] ?? []).length;
              const subtitle =
                coverageCount > 0
                  ? `${coverageCount} staff assigned`
                  : "No coverage yet";

              return (
                <ListRow
                  key={room.id}
                  title={room.name}
                  subtitle={subtitle}
                  meta="Manage room coverage"
                  onPress={() =>
                    navigation.navigate("roomDetail", {
                      workspaceId,
                      eventId,
                      roomId: room.id,
                    })
                  }
                />
              );
            })
          )}
        </VStack>
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
