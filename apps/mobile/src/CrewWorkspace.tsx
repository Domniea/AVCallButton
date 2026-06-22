import React, { useEffect } from "react";
import { VStack, Text, HStack } from "native-base";
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
import { ListRow } from "../components/ListRow";
import { LoadingScreen } from "../components/LoadingScreen";
import { ScreenLayout } from "../components/ScreenLayout";
import { SectionHeader } from "../components/SectionHeader";
import { useThemeColors } from "../hooks/useThemeColors";
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
  const { muted } = useThemeColors();

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
    return <LoadingScreen message="Checking session…" />;
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

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

  return (
    <ScreenLayout
      title={workspace ? workspaceDisplayName(workspace) : "My events"}
      subtitle="Your assigned events"
      maxW="720"
    >
      {canToggleAdmin && (
        <ViewModeToggle viewMode={effectiveViewMode} onToggle={onSwitchToAdmin} />
      )}

      {workspace ? (
        <HStack space={2} flexWrap="wrap" alignItems="center">
          <BasePill label={workspace.type} />
          {workspace.role != null ? (
            <BasePill label={workspace.role} variant="primary" />
          ) : (
            <BasePill label="Role pending" variant="warning" />
          )}
        </HStack>
      ) : null}

      <BaseCard variant="outline">
        <SectionHeader>Assigned events</SectionHeader>

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
          <VStack space={2} mt={2}>
            {listEvents.map(({ event, assignment, coverageSummary }) => {
              const subtitle = [
                event.status,
                event.startTime
                  ? new Date(event.startTime).toLocaleString()
                  : null,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <ListRow
                  key={event.id}
                  title={event.name}
                  subtitle={subtitle}
                  meta={coverageLabel(
                    coverageSummary.zoneCount,
                    coverageSummary.roomCount,
                  )}
                  onPress={() =>
                    navigation.navigate("crewEvent", {
                      workspaceId,
                      eventId: event.id,
                    })
                  }
                >
                  <HStack space={2} mt={2} flexWrap="wrap">
                    <BasePill label={assignment.roleName} variant="primary" />
                    <BasePill
                      label={`Rank ${assignment.eventRank}`}
                      variant="outline"
                    />
                  </HStack>
                </ListRow>
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
  );
}
