import React, { useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  HStack,
  ScrollView,
  useColorModeValue,
} from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

import type {
  AppDispatch,
  RootState,
  RosterAssignment,
  RosterPendingInvite,
} from "@av/store";
import { clearRoster, fetchEventsThunk, fetchRosterThunk } from "@av/store";
import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";
import { BasePill } from "../components/BasePill";
import type { RootStackParamList } from "./navigation/types";

type EventNav = NativeStackNavigationProp<RootStackParamList, "event">;
type EventRoute = RouteProp<RootStackParamList, "event">;

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

function StaffRow({
  email,
  subtitle,
  badge,
}: {
  email: string | null;
  subtitle?: string;
  badge: string;
}) {
  const rowBorder = useColorModeValue("cardBorder", "cardBorderDark");
  const surface = useColorModeValue("surface", "surfaceDark");
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");

  return (
    <HStack
      justifyContent="space-between"
      alignItems="center"
      space={3}
      py={2}
      px={3}
      borderWidth={1}
      borderColor={rowBorder}
      borderRadius="md"
      bg={surface}
    >
      <Box flex={1}>
        <Text fontSize="sm" color={textColor} numberOfLines={1}>
          {email ?? "—"}
        </Text>
        {subtitle ? (
          <Text fontSize="xs" color={muted}>
            {subtitle}
          </Text>
        ) : null}
      </Box>
      <BasePill label={badge} variant="outline" />
    </HStack>
  );
}

function assignmentSubtitle(a: RosterAssignment) {
  const parts = [a.roleName, `Event rank ${a.eventRank}`].filter(Boolean);
  return parts.join(" · ");
}

function pendingSubtitle(p: RosterPendingInvite) {
  const parts = [p.roleName, `Event rank ${p.eventRank}`].filter(Boolean);
  return parts.join(" · ");
}

export default function EventScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<EventNav>();
  const route = useRoute<EventRoute>();
  const { workspaceId, eventId } = route.params;

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const event = useSelector((state: RootState) =>
    state.events.events.find((e) => e.id === eventId),
  );
  const eventsFetchStatus = useSelector(
    (state: RootState) => state.events.fetchStatus,
  );
  const assignments = useSelector(
    (state: RootState) => state.roster.assignments,
  );
  const pendingInvites = useSelector(
    (state: RootState) => state.roster.pendingInvites,
  );
  const rosterEventId = useSelector((state: RootState) => state.roster.eventId);
  const rosterFetchStatus = useSelector(
    (state: RootState) => state.roster.fetchStatus,
  );
  const rosterFetchError = useSelector(
    (state: RootState) => state.roster.fetchError,
  );

  const bg = useColorModeValue("bg", "bgDark");
  const muted = useColorModeValue("muted", "mutedDark");
  const textColor = useColorModeValue("text", "textDark");
  const divider = useColorModeValue("cardBorder", "cardBorderDark");

  const rosterMatchesEvent =
    rosterEventId === eventId && rosterFetchStatus === "succeeded";

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      navigation.replace("landing");
    }
  }, [authStatus, navigation]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !workspaceId) return;
    if (eventsFetchStatus === "idle") {
      void dispatch(fetchEventsThunk(workspaceId));
    }
  }, [authStatus, workspaceId, eventsFetchStatus, dispatch]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !eventId) return;
    void dispatch(fetchRosterThunk(eventId));
    return () => {
      dispatch(clearRoster());
    };
  }, [authStatus, eventId, dispatch]);

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <Box flex={1} bg={bg} px={6} py={6}>
        <Text color={muted}>Loading…</Text>
      </Box>
    );
  }

  if (!event && eventsFetchStatus === "succeeded") {
    return (
      <Box flex={1} bg={bg} px={6} py={6}>
        <Text color={muted}>Event not found</Text>
      </Box>
    );
  }

  if (!event) {
    return (
      <Box flex={1} bg={bg} px={6} py={6}>
        <Text color={muted}>Loading event…</Text>
      </Box>
    );
  }

  const formattedStart = event.startTime
    ? new Date(event.startTime).toLocaleString()
    : null;
  const formattedEnd = event.endTime
    ? new Date(event.endTime).toLocaleString()
    : null;

  return (
    <Box flex={1} bg={bg}>
      <ScrollView px={6} py={6} contentContainerStyle={{ paddingBottom: 32 }}>
        <VStack space={4} maxW="840" alignSelf="center" w="100%">
          <BaseButton
            title="Back"
            variety="tertiary"
            btnWidth="auto"
            onPress={() =>
              navigation.navigate("workspace", { workspaceId })
            }
          />

          <BaseCard title={event.name} titleAlign="start" variant="elevated">
            <HStack space={2} flexWrap="wrap" mb={2}>
              <BasePill label={event.status} />
              {rosterMatchesEvent && (
                <BasePill
                  label={`${assignments.length} on roster${
                    pendingInvites.length > 0
                      ? ` · ${pendingInvites.length} pending`
                      : ""
                  }`}
                  variant="outline"
                />
              )}
            </HStack>

            <Box borderTopWidth={1} borderTopColor={divider} my={4} />

            <VStack space={6}>
              <VStack space={3}>
                <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                  Event details
                </Text>
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

              <Box borderTopWidth={1} borderTopColor={divider} pt={4}>
                <VStack space={3}>
                  <Text fontSize="sm" fontWeight="semibold" color={textColor}>
                    Staff
                  </Text>

                  {rosterFetchStatus === "loading" && (
                    <Text fontSize="sm" color={muted}>
                      Loading roster…
                    </Text>
                  )}

                  {rosterFetchStatus === "failed" && rosterFetchError && (
                    <Text fontSize="sm" color="red.500">
                      {rosterFetchError}
                    </Text>
                  )}

                  {rosterMatchesEvent &&
                    assignments.length === 0 &&
                    pendingInvites.length === 0 && (
                      <Text fontSize="sm" color={muted}>
                        No staff on this event yet.
                      </Text>
                    )}

                  {rosterMatchesEvent &&
                    (assignments.length > 0 || pendingInvites.length > 0) && (
                      <VStack space={2}>
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

                  <Box borderTopWidth={1} borderTopColor={divider} pt={4} mt={1}>
                    <BaseButton title="Assign staff" onPress={() => {}} />
                  </Box>
                </VStack>
              </Box>
            </VStack>
          </BaseCard>
        </VStack>
      </ScrollView>
    </Box>
  );
}
