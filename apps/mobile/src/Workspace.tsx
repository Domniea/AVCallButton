import React, { useEffect, useState } from "react";
import { VStack, Text, HStack } from "native-base";
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
import { ListRow } from "../components/ListRow";
import { LoadingScreen } from "../components/LoadingScreen";
import { ScreenLayout } from "../components/ScreenLayout";
import { SectionHeader } from "../components/SectionHeader";
import { useThemeColors } from "../hooks/useThemeColors";
import { ViewModeToggle } from "./components/ViewModeToggle";
import { useViewMode } from "./hooks/useViewMode";
import { canAccessAdminDash, resolveViewMode } from "./lib/viewMode";
import { workspaceDisplayName } from "./lib/workspaceDisplayName";
import CreateEventModal from "./CreateEventModal";
import type { RootStackParamList } from "./navigation/types";

type WorkspaceNav = NativeStackNavigationProp<RootStackParamList, "workspace">;
type WorkspaceRoute = RouteProp<RootStackParamList, "workspace">;

export default function WorkspaceScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<WorkspaceNav>();
  const route = useRoute<WorkspaceRoute>();
  const { workspaceId } = route.params;
  const { viewMode, setViewMode } = useViewMode();
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const { muted } = useThemeColors();

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

  const eventsMatchRoute =
    eventsWorkspaceId === workspaceId && eventsFetchStatus === "succeeded";

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
    void dispatch(fetchEventsThunk(workspaceId));
  }, [authStatus, workspaceId, dispatch]);

  if (authStatus === "idle" || authStatus === "loading") {
    return <LoadingScreen message="Checking session…" />;
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  const workspace = workspaces.find((w) => w.workspaceId === workspaceId);
  const canToggleAdmin = workspace
    ? canAccessAdminDash(workspace.roleRank)
    : false;
  const effectiveViewMode = workspace
    ? resolveViewMode(workspace.roleRank, viewMode)
    : "admin";

  const onSwitchToCrew = () => {
    void setViewMode("crew");
    navigation.replace("crewWorkspace", { workspaceId });
  };

  if (workspaceFetchStatus === "loading" && workspaces.length === 0) {
    return <LoadingScreen message="Loading workspace…" />;
  }

  if (workspaceFetchStatus === "succeeded" && !workspace) {
    return (
      <ScreenLayout maxW="720">
        <BaseButton
          title="Back to dashboard"
          variety="tertiary"
          btnWidth="auto"
          onPress={() => navigation.navigate("dashboard")}
        />
        <BaseCard title="Workspace not found" variant="outline">
          <Text color={muted} mb={4} fontSize="sm">
            You do not have access to this workspace, or the link is invalid.
          </Text>
          <BaseButton
            title="Back to dashboard"
            onPress={() => navigation.navigate("dashboard")}
          />
        </BaseCard>
      </ScreenLayout>
    );
  }

  const canCreateShow = workspace ? canAccessAdminDash(workspace.roleRank) : false;

  return (
    <>
      <CreateEventModal
        isOpen={isCreateEventOpen}
        workspaceId={workspaceId}
        onClose={() => setIsCreateEventOpen(false)}
      />
      <ScreenLayout
        title={workspace ? workspaceDisplayName(workspace) : "Workspace"}
        maxW="720"
      >
        {canToggleAdmin && (
          <ViewModeToggle
            viewMode={effectiveViewMode}
            onToggle={onSwitchToCrew}
          />
        )}

        {workspace ? (
          <HStack space={2} flexWrap="wrap" alignItems="center">
            <BasePill label={workspace.type} />
            {workspace.role != null ? (
              <BasePill label={workspace.role} variant="primary" />
            ) : (
              <BasePill label="Role pending" variant="warning" />
            )}
            <Text fontSize="sm" color={muted}>
              {workspace.eventCount} event
              {workspace.eventCount === 1 ? "" : "s"}
            </Text>
          </HStack>
        ) : null}

        <BaseCard variant="outline">
          <SectionHeader>Events</SectionHeader>

          {canCreateShow && (
            <BaseButton
              title="Create show"
              onPress={() => setIsCreateEventOpen(true)}
            />
          )}

          {eventsFetchStatus === "loading" && (
            <Text fontSize="sm" color={muted} mt={canCreateShow ? 3 : 0}>
              Loading events…
            </Text>
          )}

          {eventsFetchStatus === "failed" && eventsFetchError && (
            <VStack space={2} alignItems="flex-start" mt={3}>
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
            <Text fontSize="sm" color={muted} mt={canCreateShow ? 3 : 0}>
              No events yet.
            </Text>
          )}

          {eventsMatchRoute && events.length > 0 && (
            <VStack space={2} mt={3}>
              {events.map((ev) => {
                const subtitle = [
                  ev.status,
                  ev.startTime
                    ? new Date(ev.startTime).toLocaleString()
                    : null,
                  `${ev.zones.length} zone${ev.zones.length === 1 ? "" : "s"}`,
                  `${ev.rooms.length} room${ev.rooms.length === 1 ? "" : "s"}`,
                ]
                  .filter(Boolean)
                  .join(" · ");

                return (
                  <ListRow
                    key={ev.id}
                    title={ev.name}
                    subtitle={subtitle}
                    onPress={() =>
                      navigation.navigate("event", {
                        workspaceId,
                        eventId: ev.id,
                      })
                    }
                  />
                );
              })}
            </VStack>
          )}
        </BaseCard>

        <BaseButton
          title="Back"
          variety="tertiary"
          btnWidth="auto"
          onPress={() => navigation.navigate("dashboard")}
        />
      </ScreenLayout>
    </>
  );
}
