import React, { useCallback, useEffect, useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import { HStack, Text, VStack, useColorMode } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAuthSession } from "aws-amplify/auth";
import * as Notifications from "expo-notifications";

import type { AppDispatch, RootState } from "@av/store";
import {
  deleteEventThunk,
  fetchEventsThunk,
  fetchWorkspacesThunk,
  sendTestPush,
} from "@av/store";
import { logoutThunk } from "@av/store/src/auth";

import { BaseButton } from "../../../components/BaseButton";
import { BaseCard } from "../../../components/BaseCard";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { registerForPushNotifications } from "../../push/registerForPushNotifications";
import {
  clearLastSession,
  getLastSession,
  type LastSession,
} from "../../lib/lastSession";
import { canDeleteEvent } from "../../lib/viewMode";
import type {
  MainStackParamList,
  SettingsStackParamList,
} from "../../navigation/types";
import { navigateToWorkspaceSelector } from "../../navigation/navigateToWorkspaceSelector";

type SettingsNav = CompositeNavigationProp<
  NativeStackNavigationProp<SettingsStackParamList, "settingsHome">,
  NativeStackNavigationProp<MainStackParamList>
>;

export default function Settings() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<SettingsNav>();
  const { colorMode, setColorMode } = useColorMode();
  const { text, muted } = useThemeColors();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const user = useSelector((state: RootState) => state.auth.user);
  const workspaces = useSelector(
    (state: RootState) => state.workspace.workspaces,
  );
  const events = useSelector((state: RootState) => state.events.events);

  const [permission, setPermission] = useState<string>("undetermined");
  const [enableStatus, setEnableStatus] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [session, setSession] = useState<LastSession | null>(null);
  const [isDeletingEvent, setIsDeletingEvent] = useState(false);
  const [deleteEventStatus, setDeleteEventStatus] = useState<string | null>(
    null,
  );

  useEffect(() => {
    void (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setPermission(status);
    })();
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated" && workspaces.length === 0) {
      void dispatch(fetchWorkspacesThunk());
    }
  }, [authStatus, workspaces.length, dispatch]);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        const next = await getLastSession();
        setSession(next);
        if (next) {
          void dispatch(fetchEventsThunk(next.workspaceId));
        }
      })();
    }, [dispatch]),
  );

  const activeWorkspace = workspaces.find(
    (w) => w.workspaceId === session?.workspaceId,
  );
  const currentEvent = events.find((e) => e.id === session?.eventId);
  const showDeleteEvent =
    session != null &&
    activeWorkspace != null &&
    canDeleteEvent(activeWorkspace.roleRank);

  const onLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      await AsyncStorage.removeItem("inviteToken");
      await clearLastSession();
      // RootNavigator ternary switches to AuthNavigator.
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const onDeleteEvent = useCallback(() => {
    if (!session) return;

    const eventLabel = currentEvent?.name ?? "this event";
    Alert.alert(
      "Delete event?",
      `Delete “${eventLabel}”? This removes zones, rooms, roster, chat, and coverage. This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void (async () => {
              setIsDeletingEvent(true);
              setDeleteEventStatus(null);
              try {
                await dispatch(
                  deleteEventThunk({
                    workspaceId: session.workspaceId,
                    eventId: session.eventId,
                  }),
                ).unwrap();
                await clearLastSession();
                setSession(null);
                void dispatch(fetchWorkspacesThunk());
                navigation.navigate("eventSelector", {
                  workspaceId: session.workspaceId,
                });
              } catch (err) {
                console.error("Delete event failed:", err);
                setDeleteEventStatus(
                  typeof err === "string" ? err : "Could not delete event",
                );
              } finally {
                setIsDeletingEvent(false);
              }
            })();
          },
        },
      ],
    );
  }, [session, currentEvent?.name, dispatch, navigation]);

  const onEnableNotifications = useCallback(async () => {
    setIsEnabling(true);
    setEnableStatus(null);
    try {
      const sessionAuth = await fetchAuthSession();
      const authToken = sessionAuth.tokens?.idToken?.toString();
      if (!authToken) {
        setEnableStatus("Not signed in.");
        return;
      }

      const result = await registerForPushNotifications(authToken);
      setPermission(result.permission);

      if (result.registered) {
        setEnableStatus(
          "Notifications enabled for this device. Try Send test ping next.",
        );
      } else if (result.permission === "denied") {
        setEnableStatus(
          result.reason ??
            "Blocked in system settings. Open Settings and allow notifications for AV Call Button.",
        );
      } else {
        setEnableStatus(result.reason ?? "Permission was not granted.");
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      setEnableStatus("Could not enable notifications. Try again.");
    } finally {
      setIsEnabling(false);
    }
  }, []);

  const onSendTestPing = useCallback(async () => {
    setIsTesting(true);
    setTestStatus(null);
    try {
      const sessionAuth = await fetchAuthSession();
      const authToken = sessionAuth.tokens?.idToken?.toString();
      if (!authToken) {
        setTestStatus("Not signed in.");
        return;
      }

      const registration = await registerForPushNotifications(authToken);
      setPermission(registration.permission);

      if (!registration.registered) {
        setTestStatus(
          registration.reason ??
            "Enable notifications on this device first, then try again.",
        );
        return;
      }

      const result = await sendTestPush(authToken);
      if (result.sent > 0) {
        const osHint =
          Platform.OS === "ios"
            ? "If you don’t see a banner, check iOS Settings → Notifications → AV Call Button (and Focus / Do Not Disturb)."
            : "If you don’t see a banner, check Android notification settings for this app (and Do Not Disturb).";
        setTestStatus(
          `Sent ${result.sent} push${result.sent === 1 ? "" : "es"}. ${osHint}`,
        );
      } else {
        setTestStatus(
          "No active push subscriptions. Tap Enable notifications first.",
        );
      }
    } catch (error: unknown) {
      console.error("Test push failed:", error);
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "error" in error.response.data &&
        typeof error.response.data.error === "string"
          ? error.response.data.error
          : "Test ping failed. Enable notifications, then try again.";
      setTestStatus(message);
    } finally {
      setIsTesting(false);
    }
  }, []);

  if (authStatus === "unauthenticated") {
    return null;
  }

  return (
    <ScreenLayout subtitle={user?.email ?? user?.id} maxW="640">
      <HStack space={2} flexWrap="wrap">
        <BaseButton
          title="Select a Workspace"
          variety="tertiary"
          btnWidth="auto"
          onPress={() => navigateToWorkspaceSelector(navigation)}
        />
        <BaseButton
          title="Log out"
          variety="secondary"
          btnWidth="auto"
          onPress={onLogout}
        />
      </HStack>

      <BaseCard title="Appearance" titleAlign="start" variant="outline">
        <Text fontSize="sm" color={muted} mb={4}>
          Choose light or dark mode for this app.
        </Text>
        <HStack space={2} flexWrap="wrap">
          <BaseButton
            title="Light"
            variety={colorMode === "light" ? "primary" : "secondary"}
            btnWidth="auto"
            onPress={() => setColorMode("light")}
          />
          <BaseButton
            title="Dark"
            variety={colorMode === "dark" ? "primary" : "secondary"}
            btnWidth="auto"
            onPress={() => setColorMode("dark")}
          />
        </HStack>
      </BaseCard>

      <BaseCard title="Notifications" titleAlign="start" variant="outline">
        <VStack space={3} alignItems="stretch">
          <Text fontSize="sm" color={muted}>
            Device permission:{" "}
            <Text fontWeight="medium" color={text}>
              {permission}
            </Text>
          </Text>
          <Text fontSize="sm" color={muted}>
            Enable notifications on this device, then send a real push through
            the API. If the ping succeeds but you still see nothing, check
            system notification settings for this app.
          </Text>
          <VStack space={4} alignItems="stretch" w="100%">
            <BaseButton
              title={isEnabling ? "Enabling…" : "Enable notifications"}
              variety="secondary"
              btnWidth="100%"
              isDisabled={isEnabling}
              onPress={() => void onEnableNotifications()}
            />
            <BaseButton
              title={isTesting ? "Sending…" : "Send test ping"}
              variety="primary"
              btnWidth="100%"
              isDisabled={isTesting}
              onPress={() => void onSendTestPing()}
            />
          </VStack>
          {permission === "denied" ? (
            <BaseButton
              title="Open system settings"
              variety="tertiary"
              btnWidth="auto"
              onPress={() => void Linking.openSettings()}
            />
          ) : null}
          {enableStatus ? (
            <Text fontSize="sm" color={text}>
              {enableStatus}
            </Text>
          ) : null}
          {testStatus ? (
            <Text fontSize="sm" color={text}>
              {testStatus}
            </Text>
          ) : null}
        </VStack>
      </BaseCard>

      {showDeleteEvent ? (
        <BaseCard title="Current event" titleAlign="start" variant="outline">
          <VStack space={3} alignItems="stretch">
            <Text fontSize="sm" color={muted}>
              {currentEvent?.name
                ? `Selected: ${currentEvent.name}`
                : "Delete the event you’re currently working in."}
            </Text>
            <BaseButton
              title={isDeletingEvent ? "Deleting…" : "Delete event"}
              variety="secondary"
              btnWidth="100%"
              isDisabled={isDeletingEvent}
              onPress={onDeleteEvent}
            />
            {deleteEventStatus ? (
              <Text fontSize="sm" color={text}>
                {deleteEventStatus}
              </Text>
            ) : null}
          </VStack>
        </BaseCard>
      ) : null}

      <BaseCard title="Developer" titleAlign="start" variant="outline">
        <Text fontSize="sm" color={muted} mb={4}>
          Testing tools such as admin/crew view switching.
        </Text>
        <BaseButton
          title="Open developer menu"
          variety="tertiary"
          btnWidth="auto"
          onPress={() => navigation.navigate("devMenu")}
        />
      </BaseCard>

      <BaseCard title="More coming soon" titleAlign="start" variant="outline">
        <Text fontSize="sm" color={muted}>
          Password, profile, and other account settings will live here.
        </Text>
      </BaseCard>
    </ScreenLayout>
  );
}
