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
  fetchMyWorkspaceEventsThunk,
  fetchWorkspacesThunk,
  setActiveWorkspace,
} from "@av/store";
import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";
import { BasePill } from "../components/BasePill";
import { ViewModeToggle } from "./components/ViewModeToggle";
import { useViewMode } from "./hooks/useViewMode";
import { canAccessAdminDash, resolveViewMode } from "./lib/viewMode";
import { workspaceDisplayName } from "./lib/workspaceDisplayName";
import type { RootStackParamList } from "./navigation/types";

type CrewWorkspaceNav = NativeStackNavigationProp<
  RootStackParamList,
  "crewWorkspace"
>;
type CrewWorkspaceRoute = RouteProp<RootStackParamList, "crewWorkspace">;

function coverageLabel(zoneCount: number, roomCount: number): string {
  const parts: string[] = [];
  if (zoneCount > 0) {
    parts.push(`${zoneCount} zone${zoneCount === 1 ? "" : "s"}`);
  }
  if (roomCount > 0) {
    parts.push(`${roomCount} room${roomCount === 1 ? "" : "s"}`);
  }
  return parts.length > 0 ? parts.join(" · ") : "No coverage assigned";
}

export default function CrewWorkspaceScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<CrewWorkspaceNav>();
  const route = useRoute<CrewWorkspaceRoute>();
  const { workspaceId } = route.params;
  const { viewMode, setViewMode } = useViewMode();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const workspaces = useSelector(
    (state: RootState) => state.workspace.workspaces,
  );
  const workspaceFetchStatus = useSelector(
    (state: RootState) => state.workspace.fetchStatus,
  );
  const crewWorkspaceId = useSelector(
    (state: RootState) => state.crewDash.workspaceId,
  );
  const listEvents = useSelector((state: RootState) => state.crewDash.listEvents);
  const listStatus = useSelector(
    (state: RootState) => state.crewDash.listStatus,
  );
  const listError = useSelector((state: RootState) => state.crewDash.listError);

  const bg = useColorModeValue("bg", "bgDark");
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");
  const rowBorder = useColorModeValue("cardBorder", "cardBorderDark");

  const eventsMatchRoute =
    crewWorkspaceId === workspaceId && listStatus === "succeeded";

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      navigation.replace("login");
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
    void dispatch(fetchMyWorkspaceEventsThunk(workspaceId));
  }, [authStatus, workspaceId, dispatch]);

  const workspace = workspaces.find((w) => w.workspaceId === workspaceId);
  const canToggleAdmin = workspace
    ? canAccessAdminDash(workspace.roleRank)
    : false;
  const effectiveViewMode = workspace
    ? resolveViewMode(workspace.roleRank, viewMode)
    : "crew";

  const onSwitchToAdmin = () => {
    void setViewMode("admin");
    navigation.replace("workspace", { workspaceId });
  };

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
          {canToggleAdmin && (
            <ViewModeToggle viewMode={effectiveViewMode} onToggle={onSwitchToAdmin} />
          )}

          <BaseCard
            title={workspace ? workspaceDisplayName(workspace) : "My events"}
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
              </HStack>
            )}

            <Text fontSize="sm" fontWeight="semibold" color={textColor} mb={2}>
              Your assigned events
            </Text>

            {listStatus === "loading" && (
              <Text fontSize="sm" color={muted}>
                Loading your events…
              </Text>
            )}

            {listStatus === "failed" && listError && (
              <VStack space={2} alignItems="flex-start">
                <Text fontSize="sm" color={muted}>
                  {listError}
                </Text>
                <BaseButton
                  title="Retry"
                  variety="tertiary"
                  btnWidth="auto"
                  onPress={() =>
                    void dispatch(fetchMyWorkspaceEventsThunk(workspaceId))
                  }
                />
              </VStack>
            )}

            {eventsMatchRoute && listEvents.length === 0 && (
              <Text fontSize="sm" color={muted}>
                You are not assigned to any events in this workspace yet.
              </Text>
            )}

            {eventsMatchRoute && listEvents.length > 0 && (
              <VStack space={2}>
                {listEvents.map(({ event, assignment, coverageSummary }) => (
                  <Pressable
                    key={event.id}
                    onPress={() =>
                      navigation.navigate("crewEvent", {
                        workspaceId,
                        eventId: event.id,
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
                        {event.name}
                      </Text>
                      <Text fontSize="xs" color={muted}>
                        {event.status}
                        {event.startTime
                          ? ` · ${new Date(event.startTime).toLocaleString()}`
                          : ""}
                      </Text>
                      <HStack space={2} mt={2} flexWrap="wrap">
                        <BasePill label={assignment.roleName} variant="outline" />
                        <BasePill
                          label={`Rank ${assignment.eventRank}`}
                          variant="outline"
                        />
                      </HStack>
                      <Text fontSize="xs" color={muted} mt={2}>
                        {coverageLabel(
                          coverageSummary.zoneCount,
                          coverageSummary.roomCount,
                        )}
                      </Text>
                    </Box>
                  </Pressable>
                ))}
              </VStack>
            )}
          </BaseCard>

          <BaseButton
            title="Back"
            variety="tertiary"
            btnWidth="auto"
            onPress={() => navigation.navigate("dashboard")}
          />
        </VStack>
      </ScrollView>
    </Box>
  );
}
