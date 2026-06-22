import React, { useState } from "react";
import { VStack, Text, HStack } from "native-base";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";
import { ListRow } from "../components/ListRow";
import { LoadingScreen } from "../components/LoadingScreen";
import { ScreenLayout } from "../components/ScreenLayout";
import { SectionHeader } from "../components/SectionHeader";
import { useThemeColors } from "../hooks/useThemeColors";
import AddRoomModal from "./AddRoomModal";
import CreateZoneModal from "./CreateZoneModal";
import { roomsForZone, unassignedRooms } from "./event/eventHelpers";
import { useEventCoverage } from "./event/useEventCoverage";
import { useEventScreenData } from "./event/useEventScreenData";
import type { RootStackParamList } from "./navigation/types";

type EventZonesNav = NativeStackNavigationProp<RootStackParamList, "eventZones">;
type EventZonesRoute = RouteProp<RootStackParamList, "eventZones">;

export default function EventZonesScreen() {
  const navigation = useNavigation<EventZonesNav>();
  const route = useRoute<EventZonesRoute>();
  const { workspaceId, eventId } = route.params;
  const { muted } = useThemeColors();

  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isCreateZoneOpen, setIsCreateZoneOpen] = useState(false);

  const {
    authStatus,
    event,
    eventsFetchStatus,
  } = useEventScreenData(workspaceId, eventId);

  const { zoneCoverage, roomCoverage, coverageLoading } = useEventCoverage(
    eventId,
    event,
  );

  if (authStatus === "idle" || authStatus === "loading") {
    return <LoadingScreen message="Checking session…" />;
  }

  if (!event && eventsFetchStatus === "succeeded") {
    return <LoadingScreen message="Event not found" />;
  }

  if (!event) {
    return <LoadingScreen message="Loading event…" />;
  }

  const unassigned = unassignedRooms(event.rooms);

  return (
    <>
      <ScreenLayout
        title="Zones & rooms"
        subtitle={event.name}
        maxW="720"
      >
        <HStack space={2} flexWrap="wrap">
          <BaseButton
            title="Create zone"
            variety="secondary"
            btnWidth="auto"
            onPress={() => setIsCreateZoneOpen(true)}
          />
          <BaseButton
            title="Add room"
            variety="secondary"
            btnWidth="auto"
            onPress={() => setIsAddRoomOpen(true)}
          />
        </HStack>

        {coverageLoading && (
          <Text fontSize="sm" color={muted}>
            Loading coverage…
          </Text>
        )}

        {event.zones.length === 0 && event.rooms.length === 0 ? (
          <BaseCard variant="outline">
            <Text fontSize="sm" color={muted}>
              No zones or rooms yet. Create a zone or add a room to get started.
            </Text>
          </BaseCard>
        ) : (
          <VStack space={4}>
            {event.zones.length > 0 && (
              <VStack space={3}>
                <SectionHeader>Zones</SectionHeader>
                {event.zones.map((zone) => {
                  const zoneRooms = roomsForZone(event.rooms, zone.id);
                  const coverageCount = (zoneCoverage[zone.id] ?? []).length;
                  const subtitle = [
                    zoneRooms.length === 1
                      ? "1 room"
                      : `${zoneRooms.length} rooms`,
                    coverageCount > 0
                      ? `${coverageCount} on zone coverage`
                      : "No zone coverage yet",
                  ].join(" · ");

                  return (
                    <ListRow
                      key={zone.id}
                      title={zone.name}
                      subtitle={subtitle}
                      meta="View zone coverage and rooms"
                      onPress={() =>
                        navigation.navigate("zoneDetail", {
                          workspaceId,
                          eventId,
                          zoneId: zone.id,
                        })
                      }
                    />
                  );
                })}
              </VStack>
            )}

            {unassigned.length > 0 && (
              <VStack space={3}>
                <SectionHeader>Unassigned rooms</SectionHeader>
                {unassigned.map((room) => {
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
                      meta="Not in a zone"
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
            )}
          </VStack>
        )}
      </ScreenLayout>

      <AddRoomModal
        isOpen={isAddRoomOpen}
        eventId={eventId}
        workspaceId={workspaceId}
        zones={event.zones}
        onClose={() => setIsAddRoomOpen(false)}
      />
      <CreateZoneModal
        isOpen={isCreateZoneOpen}
        eventId={eventId}
        workspaceId={workspaceId}
        rooms={event.rooms}
        onClose={() => setIsCreateZoneOpen(false)}
      />
    </>
  );
}
