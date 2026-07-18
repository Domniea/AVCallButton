import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { upsertDeviceToken, type DevicePlatform } from "@av/store";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export type PushRegistrationResult = {
  permission: string;
  registered: boolean;
  reason?: string;
};

function resolveDevicePlatform(): DevicePlatform | null {
  if (Platform.OS === "ios") return "IOS";
  if (Platform.OS === "android") return "ANDROID";
  return null;
}

function resolveProjectId(): string | null {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  return typeof projectId === "string" && projectId.length > 0
    ? projectId
    : null;
}

async function ensureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync("default", {
    name: "Alerts",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });
}

/** Request permission, obtain Expo push token, and register it with the backend. */
export async function registerForPushNotifications(
  authToken: string,
): Promise<PushRegistrationResult> {
  if (!Device.isDevice) {
    console.warn("Push registration skipped: not a physical device");
    return {
      permission: "undetermined",
      registered: false,
      reason: "Push requires a physical device (not a simulator).",
    };
  }

  const platform = resolveDevicePlatform();
  if (!platform) {
    console.warn("Push registration skipped: unsupported platform");
    return {
      permission: "undetermined",
      registered: false,
      reason: "Unsupported platform.",
    };
  }

  const projectId = resolveProjectId();
  if (!projectId) {
    console.warn("Push registration skipped: missing EAS projectId");
    return {
      permission: "undetermined",
      registered: false,
      reason: "Missing EAS projectId in app config.",
    };
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("Push registration skipped: notification permission denied");
    return {
      permission: finalStatus,
      registered: false,
      reason:
        "Notification permission denied. Enable it in system Settings for this app.",
    };
  }

  await ensureAndroidNotificationChannel();

  const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });

  await upsertDeviceToken(authToken, {
    platform,
    token: pushToken.data,
  });

  return { permission: finalStatus, registered: true };
}
