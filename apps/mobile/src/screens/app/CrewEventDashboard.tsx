import React, { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Box,
  VStack,
  Text,
  HStack,
  ScrollView,
  useColorModeValue,
} from "../../../components/ui/layout";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { AppDispatch, RootState } from "@av/store";
import { clearCrewDashDetail, fetchMyEventDetailThunk } from "@av/store";
import { BaseButton } from "../../../components/BaseButton";
import { BaseCard } from "../../../components/BaseCard";
import { BasePill } from "../../../components/BasePill";
import { OpenAlertsRow } from "../../event/OpenAlertsRow";
import type {
  DashStackParamList,
  MainStackParamList,
} from "../../navigation/types";

type CrewEventDashboardNav = NativeStackNavigationProp<
  DashStackParamList & Pick<MainStackParamList, "crewEventSelector">
>;
type CrewEventDashboardRoute = RouteProp<DashStackParamList, "eventHome">;

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  const muted = useColorModeValue("muted", "mutedDark");
  const textColor = useColorModeValue("text", "textDark");

  if (!value) return null;
  return (
    <Box>
      <Text fontSize="xs" color={muted} mb={0.5}>
        {label}
      </Text>
      <Text fontSize="sm" color={textColor}>
        {value}
      </Text>
    </Box>
  );
}

function formatDateTime(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleString();
}

export default function CrewEventDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<CrewEventDashboardNav>();
  const route = useRoute<CrewEventDashboardRoute>();
  const insets = useSafeAreaInsets();
  const { workspaceId, eventId } = route.params;

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

  const bg = useColorModeValue("bg", "bgDark");
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");
  const rowBorder = useColorModeValue("cardBorder", "cardBorderDark");
  const surface = useColorModeValue("surface", "surfaceDark");

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

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <Box flex={1} bg={bg} justifyContent="center" alignItems="center">
        <Text color={muted}>Checking session…</Text>
      </Box>
    );
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  return (
    <Box flex={1} bg={bg}>
      <ScrollView
        px={6}
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: 32,
        }}
      >
        <VStack space={4} maxW="720" alignSelf="center" w="100%">
          {detailStatus === "loading" && (
            <Text color={muted}>Loading your event coverage…</Text>
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

          <OpenAlertsRow subtitle="Active requests for this event" />

          {detailMatchesRoute && detail && (
            <>
              <BaseCard
                title={detail.event.name}
                titleAlign="start"
                variant="elevated"
              >
                <HStack space={2} flexWrap="wrap" mb={4}>
                  <BasePill label={detail.event.status} />
                  <BasePill
                    label={detail.assignment.roleName}
                    variant="primary"
                  />
                  <BasePill
                    label={`Event rank ${detail.assignment.eventRank}`}
                    variant="outline"
                  />
                </HStack>

                <VStack space={3}>
                  <DetailRow label="Workspace" value={detail.workspace.name} />
                  <DetailRow label="Location" value={detail.event.location} />
                  <DetailRow label="Venue" value={detail.event.venue} />
                  <DetailRow
                    label="Starts"
                    value={formatDateTime(detail.event.startTime)}
                  />
                  <DetailRow
                    label="Ends"
                    value={formatDateTime(detail.event.endTime)}
                  />
                </VStack>
              </BaseCard>

              <BaseCard
                title="Your coverage"
                titleAlign="start"
                variant="elevated"
              >
                {detail.zones.length === 0 &&
                detail.roomsWithoutZone.length === 0 ? (
                  <Text fontSize="sm" color={muted}>
                    No zone or room coverage assigned yet.
                  </Text>
                ) : (
                  <VStack space={3}>
                    {detail.zones.map((zone) => (
                      <Box
                        key={zone.id}
                        borderWidth={1}
                        borderColor={rowBorder}
                        borderRadius="md"
                        bg={surface}
                        px={3}
                        py={2}
                      >
                        <HStack
                          justifyContent="space-between"
                          alignItems="center"
                          flexWrap="wrap"
                          space={2}
                        >
                          <Text
                            fontSize="sm"
                            fontWeight="medium"
                            color={textColor}
                          >
                            {zone.name}
                          </Text>
                          <BasePill
                            label={`Rank ${zone.eventRank}`}
                            variant="outline"
                          />
                        </HStack>
                        {zone.rooms.length > 0 ? (
                          <VStack space={1} mt={2}>
                            {zone.rooms.map((room) => (
                              <Text key={room.id} fontSize="xs" color={muted}>
                                {room.name} · rank {room.eventRank}
                              </Text>
                            ))}
                          </VStack>
                        ) : (
                          <Text fontSize="xs" color={muted} mt={2}>
                            No rooms in this zone
                          </Text>
                        )}
                      </Box>
                    ))}

                    {detail.roomsWithoutZone.length > 0 ? (
                      <VStack space={2}>
                        <Text
                          fontSize="sm"
                          fontWeight="semibold"
                          color={textColor}
                        >
                          Rooms (no zone)
                        </Text>
                        {detail.roomsWithoutZone.map((room) => (
                          <Box
                            key={room.id}
                            borderWidth={1}
                            borderColor={rowBorder}
                            borderRadius="md"
                            bg={surface}
                            px={3}
                            py={2}
                          >
                            <HStack
                              justifyContent="space-between"
                              alignItems="center"
                            >
                              <Text fontSize="sm" color={textColor}>
                                {room.name}
                              </Text>
                              <BasePill
                                label={`Rank ${room.eventRank}`}
                                variant="outline"
                              />
                            </HStack>
                          </Box>
                        ))}
                      </VStack>
                    ) : null}
                  </VStack>
                )}
              </BaseCard>
            </>
          )}

          <BaseButton
            title="Select an Event"
            variety="tertiary"
            btnWidth="auto"
            onPress={() =>
              navigation.navigate("crewEventSelector", { workspaceId })
            }
          />
        </VStack>
      </ScrollView>
    </Box>
  );
}
