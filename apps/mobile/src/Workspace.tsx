import React, { useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  HStack,
  ScrollView,
  Pressable,
  useColorModeValue,
} from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";

import type { AppDispatch, RootState } from "@av/store";
import {
  fetchWorkspacesThunk,
  fetchEventsThunk,
  setActiveWorkspace,
} from "@av/store";
import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";
import { BasePill } from "../components/BasePill";
import { workspaceDisplayName } from "./lib/workspaceDisplayName";
import type { RootStackParamList } from "./navigation/types";

type WorkspaceNav = NativeStackNavigationProp<RootStackParamList, "workspace">;
type WorkspaceRoute = RouteProp<RootStackParamList, "workspace">;

export default function WorkspaceScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<WorkspaceNav>();
  const route = useRoute<WorkspaceRoute>();
  const { workspaceId } = route.params;

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const workspaces = useSelector(
    (state: RootState) => state.workspace.workspaces,
  );
  const workspaceFetchStatus = useSelector(
    (state: RootState) => state.workspace.fetchStatus,
  );
  const eventsWorkspaceId = useSelector(
    (state: RootState) => state.events.workspaceId,
  );
  const events = useSelector((state: RootState) => state.events.events);
  const eventsFetchStatus = useSelector(
    (state: RootState) => state.events.fetchStatus,
  );
  const eventsFetchError = useSelector(
    (state: RootState) => state.events.fetchError,
  );

  const bg = useColorModeValue("bg", "bgDark");
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");
  const rowBorder = useColorModeValue("cardBorder", "cardBorderDark");

  const eventsMatchRoute =
    eventsWorkspaceId === workspaceId && eventsFetchStatus === "succeeded";

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      navigation.replace("landing");
    }
  }, [authStatus, navigation]);

  useEffect(() => {
    if (
      authStatus === "authenticated" &&
      workspaces.length === 0 &&
      workspaceFetchStatus === "idle"
    ) {
      void dispatch(fetchWorkspacesThunk());
    }
  }, [authStatus, workspaces.length, workspaceFetchStatus, dispatch]);

  useEffect(() => {
    const ws = workspaces.find((w) => w.workspaceId === workspaceId);
    if (ws) {
      dispatch(setActiveWorkspace(workspaceId));
    }
  }, [workspaceId, workspaces, dispatch]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !workspaceId) return;
    void dispatch(fetchEventsThunk(workspaceId));
  }, [authStatus, workspaceId, dispatch]);

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

  const workspace = workspaces.find((w) => w.workspaceId === workspaceId);

  if (workspaceFetchStatus === "loading" && workspaces.length === 0) {
    return (
      <Box flex={1} bg={bg} px={6} py={6}>
        <Text color={muted}>Loading workspace…</Text>
      </Box>
    );
  }

  if (workspaceFetchStatus === "succeeded" && !workspace) {
    return (
      <Box flex={1} bg={bg} px={6} py={6}>
        <VStack space={4}>
          <BaseButton
            title="Back to dashboard"
            variety="tertiary"
            btnWidth="auto"
            onPress={() => navigation.navigate("dashboard")}
          />
          <BaseCard title="Workspace not found" variant="outline">
            <Text color={muted} mb={4}>
              You do not have access to this workspace, or the link is invalid.
            </Text>
            <BaseButton
              title="Back to dashboard"
              onPress={() => navigation.navigate("dashboard")}
            />
          </BaseCard>
        </VStack>
      </Box>
    );
  }

  return (
    <Box flex={1} bg={bg}>
      <ScrollView px={6} py={6} contentContainerStyle={{ paddingBottom: 32 }}>
        <VStack space={4} maxW="720" alignSelf="center" w="100%">
          <BaseButton
            title="Back"
            variety="tertiary"
            btnWidth="auto"
            onPress={() => navigation.navigate("dashboard")}
          />

          <BaseCard
            title={workspace ? workspaceDisplayName(workspace) : "Workspace"}
            titleAlign="start"
            variant="elevated"
          >
            {workspace && (
              <HStack space={2} flexWrap="wrap" mb={4} alignItems="center">
                <BasePill label={workspace.type} />
                {workspace.role != null ? (
                  <BasePill label={workspace.role} variant="blue" />
                ) : (
                  <BasePill label="Role pending" variant="outline" />
                )}
                <Text fontSize="sm" color={muted}>
                  {workspace.eventCount} event
                  {workspace.eventCount === 1 ? "" : "s"}
                </Text>
              </HStack>
            )}

            <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
              Events
            </Text>

            {eventsFetchStatus === "loading" && (
              <Text fontSize="sm" color={muted}>
                Loading events…
              </Text>
            )}

            {eventsFetchStatus === "failed" && eventsFetchError && (
              <VStack space={2} alignItems="flex-start">
                <Text fontSize="sm" color={muted}>
                  {eventsFetchError}
                </Text>
                <BaseButton
                  title="Retry"
                  variety="tertiary"
                  btnWidth="auto"
                  onPress={() => void dispatch(fetchEventsThunk(workspaceId))}
                />
              </VStack>
            )}

            {eventsMatchRoute && events.length === 0 && (
              <Text fontSize="sm" color={muted}>
                No events yet.
              </Text>
            )}

            {eventsMatchRoute && events.length > 0 && (
              <VStack space={2}>
                {events.map((ev) => (
                  <Pressable
                    key={ev.id}
                    onPress={() =>
                      navigation.navigate("event", {
                        workspaceId,
                        eventId: ev.id,
                      })
                    }
                  >
                    <Box
                      borderWidth={1}
                      borderColor={rowBorder}
                      borderRadius="md"
                      px={3}
                      py={2}
                    >
                      <Text fontSize="sm" fontWeight="medium" color={textColor}>
                        {ev.name}
                      </Text>
                      <Text fontSize="xs" color={muted}>
                        {ev.status}
                        {ev.startTime
                          ? ` · ${new Date(ev.startTime).toLocaleString()}`
                          : ""}
                        {` · ${ev.zones.length} zone${ev.zones.length === 1 ? "" : "s"}`}
                        {` · ${ev.rooms.length} room${ev.rooms.length === 1 ? "" : "s"}`}
                      </Text>
                    </Box>
                  </Pressable>
                ))}
              </VStack>
            )}
          </BaseCard>
        </VStack>
      </ScrollView>
    </Box>
  );
}
