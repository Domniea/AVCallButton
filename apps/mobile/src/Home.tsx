import React, { useCallback, useEffect, useState } from "react";
import { Linking, Platform } from "react-native";
import { HStack, Text, VStack, useColorMode } from "native-base";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchAuthSession } from "aws-amplify/auth";
import * as Notifications from "expo-notifications";

import type { AppDispatch, RootState } from "@av/store";
import { sendTestPush } from "@av/store";
import { logoutThunk } from "@av/store/src/auth";

import { BaseButton } from "../components/BaseButton";
import { BaseCard } from "../components/BaseCard";
import { ScreenLayout } from "../components/ScreenLayout";
import { useThemeColors } from "../hooks/useThemeColors";
import { registerForPushNotifications } from "./push/registerForPushNotifications";
import type { RootStackParamList } from "./navigation/types";

type HomeNav = NativeStackNavigationProp<RootStackParamList, "home">;

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<HomeNav>();
  const { colorMode, setColorMode } = useColorMode();
  const { text, muted } = useThemeColors();

  const authStatus = useSelector((state: RootState) => state.auth.status);
  const user = useSelector((state: RootState) => state.auth.user);

  const [permission, setPermission] = useState<string>("undetermined");
  const [enableStatus, setEnableStatus] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      navigation.replace("login");
    }
  }, [authStatus, navigation]);

  useEffect(() => {
    void (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setPermission(status);
    })();
  }, []);

  const onLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      await AsyncStorage.removeItem("inviteToken");
      navigation.replace("login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const onEnableNotifications = useCallback(async () => {
    setIsEnabling(true);
    setEnableStatus(null);
    try {
      const session = await fetchAuthSession();
      const authToken = session.tokens?.idToken?.toString();
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
      const session = await fetchAuthSession();
      const authToken = session.tokens?.idToken?.toString();
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

  if (authStatus === "idle" || authStatus === "loading") {
    return (
      <ScreenLayout>
        <Text color={muted}>Checking session…</Text>
      </ScreenLayout>
    );
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  return (
    <ScreenLayout
      title="Account"
      subtitle={user?.email ?? user?.id}
      maxW="640"
    >
      <HStack space={2} flexWrap="wrap">
        <BaseButton
          title="Back to dashboard"
          variety="tertiary"
          btnWidth="auto"
          onPress={() => navigation.navigate("dashboard")}
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

      <BaseCard title="More coming soon" titleAlign="start" variant="outline">
        <Text fontSize="sm" color={muted}>
          Password, profile, and other account settings will live here.
        </Text>
      </BaseCard>
    </ScreenLayout>
  );
}
