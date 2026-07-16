import { upsertDeviceToken } from "@av/store";

import { urlBase64ToUint8Array } from "./vapid";

function resolveVapidPublicKey(): string | null {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

function isWebPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Ask permission, install the service worker, subscribe, and save it on the backend. */
export async function registerForWebPush(authToken: string): Promise<void> {
  if (!isWebPushSupported()) {
    console.warn("Web push registration skipped: not supported in this browser");
    return;
  }

  const vapidPublicKey = resolveVapidPublicKey();
  if (!vapidPublicKey) {
    console.warn(
      "Web push registration skipped: missing NEXT_PUBLIC_VAPID_PUBLIC_KEY",
    );
    return;
  }

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") {
    console.warn("Web push registration skipped: notification permission denied");
    return;
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        vapidPublicKey,
      ) as BufferSource,
    });
  }

  await upsertDeviceToken(authToken, {
    platform: "WEB",
    token: JSON.stringify(subscription.toJSON()),
  });
}
