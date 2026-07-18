"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Box, Flex, HStack, Text, VStack } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchAuthSession } from "aws-amplify/auth";

import type { AppDispatch, RootState } from "@av/store";
import { sendTestPush } from "@av/store";
import { logoutThunk } from "@av/store/src/auth";

import { BaseButton } from "@/components/reusable/BaseButton";
import { BaseCard } from "@/components/reusable/BaseCard";
import { useColorMode } from "@/components/ui/color-mode";
import { registerForWebPush } from "@/lib/push/registerWebPush";

type NotificationPermissionState = NotificationPermission | "unsupported";

function readNotificationPermission(): NotificationPermissionState {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

export default function AccountPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { colorMode, setColorMode } = useColorMode();
  const authStatus = useSelector((state: RootState) => state.auth.status);
  const user = useSelector((state: RootState) => state.auth.user);

  const [permission, setPermission] = useState<NotificationPermissionState>(
    "default",
  );
  const [enableStatus, setEnableStatus] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isEnabling, setIsEnabling] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.replace("/");
    }
  }, [authStatus, router]);

  useEffect(() => {
    setPermission(readNotificationPermission());
  }, []);

  const onLogout = async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
      router.replace("/");
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

      await registerForWebPush(authToken);
      const nextPermission = readNotificationPermission();
      setPermission(nextPermission);

      if (nextPermission === "granted") {
        setEnableStatus(
          "Notifications enabled for this browser. Try Send test ping next.",
        );
      } else if (nextPermission === "denied") {
        setEnableStatus(
          "Blocked in the browser. Use the lock icon in the address bar → Notifications → Allow.",
        );
      } else {
        setEnableStatus("Permission was not granted.");
      }
    } catch (error) {
      console.error("Failed to enable notifications:", error);
      setEnableStatus("Could not enable notifications. Check the console.");
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

      // Re-register first so this browser’s subscription is saved.
      await registerForWebPush(authToken);
      setPermission(readNotificationPermission());

      const result = await sendTestPush(authToken);
      if (result.sent > 0) {
        setTestStatus(
          `Sent ${result.sent} push${result.sent === 1 ? "" : "es"}. If you don’t see a banner, check macOS System Settings → Notifications → Chrome (or Safari).`,
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
      <Box
        height="100vh"
        bg="bg"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="gray.500">Checking session…</Text>
      </Box>
    );
  }

  if (authStatus === "unauthenticated") {
    return null;
  }

  return (
    <Box minHeight="100vh" bg="bg" px={6} py={10}>
      <VStack align="stretch" maxWidth="640px" mx="auto" gap={6}>
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "start", sm: "center" }}
          gap={4}
        >
          <VStack align="start" gap={1}>
            <Text fontSize="2xl" fontWeight="bold" color="text">
              Account
            </Text>
            {user && (
              <Text fontSize="sm" color="gray.500">
                {user.email ?? user.id}
              </Text>
            )}
          </VStack>
          <HStack flexWrap="wrap">
            <BaseButton
              variety="tertiary"
              onClick={() => router.push("/dashboard")}
            >
              Back to dashboard
            </BaseButton>
            <BaseButton variety="secondary" onClick={onLogout}>
              Log out
            </BaseButton>
          </HStack>
        </Flex>

        <BaseCard title="Appearance" titleAlign="start" variant="outline">
          <Text fontSize="sm" color="gray.500" mb={4}>
            Choose light or dark mode for this browser.
          </Text>
          <HStack gap={2} flexWrap="wrap">
            <BaseButton
              variety={colorMode === "light" ? "primary" : "secondary"}
              btnWidth="auto"
              onClick={() => setColorMode("light")}
            >
              Light
            </BaseButton>
            <BaseButton
              variety={colorMode === "dark" ? "primary" : "secondary"}
              btnWidth="auto"
              onClick={() => setColorMode("dark")}
            >
              Dark
            </BaseButton>
          </HStack>
        </BaseCard>

        <BaseCard title="Notifications" titleAlign="start" variant="outline">
          <VStack align="stretch" gap={3}>
            <Text fontSize="sm" color="gray.500">
              Browser permission:{" "}
              <Text as="span" fontWeight="medium" color="text">
                {permission}
              </Text>
            </Text>
            <Text fontSize="sm" color="gray.500">
              Enable notifications in this browser, then send a real push through
              the API. If the ping succeeds but you still see nothing, turn on
              Chrome/Safari in macOS System Settings → Notifications.
            </Text>
            <HStack gap={4} flexWrap="wrap" rowGap={3}>
              <BaseButton
                variety="secondary"
                btnWidth="auto"
                disabled={isEnabling}
                onClick={() => void onEnableNotifications()}
              >
                {isEnabling ? "Enabling…" : "Enable notifications"}
              </BaseButton>
              <BaseButton
                variety="primary"
                btnWidth="auto"
                disabled={isTesting}
                onClick={() => void onSendTestPing()}
              >
                {isTesting ? "Sending…" : "Send test ping"}
              </BaseButton>
            </HStack>
            {enableStatus && (
              <Text fontSize="sm" color="text">
                {enableStatus}
              </Text>
            )}
            {testStatus && (
              <Text fontSize="sm" color="text">
                {testStatus}
              </Text>
            )}
          </VStack>
        </BaseCard>

        <BaseCard title="More coming soon" titleAlign="start" variant="outline">
          <Text fontSize="sm" color="gray.500">
            Password, profile, and other account settings will live here.
          </Text>
        </BaseCard>
      </VStack>
    </Box>
  );
}
