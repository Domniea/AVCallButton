import React, { useEffect, useRef } from "react";
import { VStack, Text, HStack } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AppDispatch, RootState } from "@av/store";
import { fetchWorkspacesThunk, setActiveWorkspace } from "@av/store";
import { logoutThunk } from "@av/store/src/auth";
import { BaseButton } from "../../../components/BaseButton";
import { BaseCard } from "../../../components/BaseCard";
import { BasePill } from "../../../components/BasePill";
import { ListRow } from "../../../components/ListRow";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useViewMode } from "../../hooks/useViewMode";
import { resolveViewMode } from "../../lib/viewMode";
import { clearLastSession, getLastSession } from "../../lib/lastSession";
import { workspaceDisplayName } from "../../lib/workspaceDisplayName";
import { navigateToEventHome } from "../../navigation/navigateToWorkspaceSelector";
import type { MainStackParamList } from "../../navigation/types";

type WorkspaceSelectorNav = NativeStackNavigationProp<MainStackParamList>;

export default function WorkspaceSelector() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<WorkspaceSelectorNav>();
  const { viewMode } = useViewMode();
  const { text, muted, primary } = useThemeColors();
  const didBootstrap = useRef(false);

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const user = useSelector((state: RootState) => state.auth.user);
  const workspaces = useSelector(
    (state: RootState) => state.workspace.workspaces,
  );
  const activeWorkspaceId = useSelector(
    (state: RootState) => state.workspace.activeWorkspaceId,
  );
  const fetchStatus = useSelector(
    (state: RootState) => state.workspace.fetchStatus,
  );
  const fetchError = useSelector(
    (state: RootState) => state.workspace.fetchError,
  );

  /** Restore invite / last event only after this screen’s navigator is mounted. */
  useEffect(() => {
    if (didBootstrap.current) return;
    didBootstrap.current = true;

    void (async () => {
      const inviteToken = await AsyncStorage.getItem("inviteToken");
      if (inviteToken) {
        navigation.navigate("invite", { token: inviteToken });
        return;
      }

      const session = await getLastSession();
      if (!session) return;

      dispatch(setActiveWorkspace(session.workspaceId));
      navigateToEventHome(navigation, session.workspaceId, session.eventId);
    })();
  }, [navigation, dispatch]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      void dispatch(fetchWorkspacesThunk());
    }
  }, [authStatus, dispatch]);

  const onLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      await clearLastSession();
      // RootNavigator ternary switches to AuthNavigator.
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const activeWorkspace = workspaces.find(
    (w) => w.workspaceId === activeWorkspaceId,
  );

  const subtitleParts = [user?.email ?? user?.id].filter(Boolean);
  if (activeWorkspace) {
    subtitleParts.push(`Active: ${workspaceDisplayName(activeWorkspace)}`);
  }

  return (
    <ScreenLayout subtitle={subtitleParts.join(" · ") || undefined}>
      <HStack space={2} flexWrap="wrap">
        <BaseButton
          title="Settings"
          variety="tertiary"
          btnWidth="auto"
          onPress={() => navigation.navigate("settings")}
        />
        <BaseButton
          title="Log out"
          variety="secondary"
          btnWidth="auto"
          onPress={onLogout}
        />
      </HStack>

      {fetchStatus === "loading" && (
        <Text color={muted} fontSize="sm">
          Loading workspaces…
        </Text>
      )}

      {fetchStatus === "failed" && fetchError && (
        <BaseCard variant="outline" title="Something went wrong">
          <Text color={text} mb={4} fontSize="sm">
            {fetchError}
          </Text>
          <BaseButton
            title="Retry"
            onPress={() => void dispatch(fetchWorkspacesThunk())}
          />
        </BaseCard>
      )}

      {fetchStatus !== "loading" &&
        fetchStatus !== "failed" &&
        workspaces.length === 0 && (
          <BaseCard variant="outline" title="No workspaces yet">
            <Text color={muted} fontSize="sm">
              When you join or create a workspace, it will show up here.
            </Text>
          </BaseCard>
        )}

      <VStack space={3}>
        {workspaces.map((ws) => {
          const isActive = ws.workspaceId === activeWorkspaceId;
          const eventLabel =
            ws.eventCount === 0
              ? "No events yet"
              : `${ws.eventCount} event${ws.eventCount === 1 ? "" : "s"}`;

          return (
            <ListRow
              key={ws.workspaceId}
              title={workspaceDisplayName(ws)}
              subtitle={eventLabel}
              meta="Open to view events and details"
              accentColor={isActive ? primary : undefined}
              onPress={() => {
                dispatch(setActiveWorkspace(ws.workspaceId));
                const mode = resolveViewMode(ws.roleRank, viewMode);
                if (mode === "admin") {
                  navigation.navigate("eventSelector", {
                    workspaceId: ws.workspaceId,
                  });
                } else {
                  navigation.navigate("crewEventSelector", {
                    workspaceId: ws.workspaceId,
                  });
                }
              }}
            >
              <HStack space={2} flexWrap="wrap" mt={2}>
                <BasePill label={ws.type} />
                {ws.role != null ? (
                  <BasePill label={ws.role} variant="primary" />
                ) : (
                  <BasePill label="Role pending" variant="warning" />
                )}
              </HStack>
            </ListRow>
          );
        })}
      </VStack>
    </ScreenLayout>
  );
}
