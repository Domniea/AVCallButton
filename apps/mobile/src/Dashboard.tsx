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
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { AppDispatch, RootState } from "@av/store";
import { fetchWorkspacesThunk, setActiveWorkspace } from "@av/store";
import { logoutThunk } from "@av/store/src/auth";
import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";
import { BasePill } from "../components/BasePill";
import { useViewMode } from "./hooks/useViewMode";
import { resolveViewMode } from "./lib/viewMode";
import { workspaceDisplayName } from "./lib/workspaceDisplayName";
import type { RootStackParamList } from "./navigation/types";

type DashboardNav = NativeStackNavigationProp<RootStackParamList, "dashboard">;

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<DashboardNav>();
  const { viewMode } = useViewMode();

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

  const bg = useColorModeValue("bg", "bgDark");
  const textColor = useColorModeValue("text", "textDark");
  const muted = useColorModeValue("muted", "mutedDark");
  const activeBorder = useColorModeValue("blue.500", "blue.400");

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      navigation.replace("login");
    }
  }, [authStatus, navigation]);

  useEffect(() => {
    if (authStatus === "authenticated") {
      void dispatch(fetchWorkspacesThunk());
    }
  }, [authStatus, dispatch]);

  const onLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      navigation.replace("login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
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

  const activeWorkspace = workspaces.find(
    (w) => w.workspaceId === activeWorkspaceId,
  );

  return (
    <Box flex={1} bg={bg}>
      <ScrollView px={6} py={6} contentContainerStyle={{ paddingBottom: 32 }}>
        <VStack space={6} maxW="960" alignSelf="center" w="100%">
          <VStack space={1}>
            <Text fontSize="2xl" fontWeight="bold" color={textColor}>
              Dashboard
            </Text>
            {user && (
              <Text fontSize="sm" color={muted}>
                {user.email ?? user.id}
              </Text>
            )}
            {activeWorkspace && (
              <Text fontSize="xs" color={muted}>
                Active workspace:{" "}
                <Text fontWeight="medium" color={textColor}>
                  {workspaceDisplayName(activeWorkspace)}
                </Text>
              </Text>
            )}
          </VStack>

          <HStack space={2} flexWrap="wrap">
            <BaseButton
              title="Account"
              variety="tertiary"
              btnWidth="auto"
              onPress={() => navigation.navigate("home")}
            />
            <BaseButton
              title="Log out"
              variety="secondary"
              btnWidth="auto"
              onPress={onLogout}
            />
          </HStack>

          {fetchStatus === "loading" && (
            <Text color={muted}>Loading workspaces…</Text>
          )}

          {fetchStatus === "failed" && fetchError && (
            <BaseCard variant="outline" title="Something went wrong">
              <Text color={textColor} mb={4}>
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
              <BaseCard title="No workspaces yet">
                <Text color={muted}>
                  When you join or create a workspace, it will show up here.
                </Text>
              </BaseCard>
            )}

          <VStack space={4}>
            {workspaces.map((ws) => {
              const isActive = ws.workspaceId === activeWorkspaceId;
              return (
                <Pressable
                  key={ws.workspaceId}
                  onPress={() => {
                    dispatch(setActiveWorkspace(ws.workspaceId));
                    const mode = resolveViewMode(ws.roleRank, viewMode);
                    if (mode === "admin") {
                      navigation.navigate("workspace", {
                        workspaceId: ws.workspaceId,
                      });
                    } else {
                      navigation.navigate("crewWorkspace", {
                        workspaceId: ws.workspaceId,
                      });
                    }
                  }}
                >
                  <Box
                    borderWidth={isActive ? 2 : 0}
                    borderColor={activeBorder}
                    borderRadius="xl"
                  >
                    <BaseCard
                      title={workspaceDisplayName(ws)}
                      titleAlign="start"
                      variant="elevated"
                    >
                      <HStack space={2} flexWrap="wrap" mb={3}>
                        <BasePill label={ws.type} />
                        {ws.role != null ? (
                          <BasePill label={ws.role} variant="blue" />
                        ) : (
                          <BasePill label="Role pending" variant="outline" />
                        )}
                      </HStack>
                      <Text fontSize="sm" color={muted}>
                        {ws.eventCount === 0
                          ? "No events yet"
                          : `${ws.eventCount} event${ws.eventCount === 1 ? "" : "s"}`}
                      </Text>
                      <Text fontSize="xs" color={muted} mt={3}>
                        Open to view events and details
                      </Text>
                    </BaseCard>
                  </Box>
                </Pressable>
              );
            })}
          </VStack>
        </VStack>
      </ScrollView>
    </Box>
  );
}
