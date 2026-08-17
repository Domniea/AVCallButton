import * as Notifications from "expo-notifications";

import { navigateToChatThread } from "../navigation/navigationRef";

type ChatPushData = {
  type?: string;
  threadId?: string;
  title?: string;
};

function readChatData(data: unknown): ChatPushData | null {
  if (typeof data !== "object" || data === null) return null;
  const row = data as Record<string, unknown>;
  if (row.type !== "chat") return null;
  if (typeof row.threadId !== "string" || !row.threadId) return null;
  return {
    type: "chat",
    threadId: row.threadId,
    title: typeof row.title === "string" ? row.title : undefined,
  };
}

function openFromData(data: unknown) {
  const chat = readChatData(data);
  if (!chat) return;
  navigateToChatThread({
    threadId: chat.threadId!,
    title: chat.title,
  });
}

/** Wire notification taps (foreground + cold start) to the chat thread. */
export function subscribeChatNotificationResponses(): () => void {
  const sub = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      openFromData(response.notification.request.content.data);
    },
  );

  void Notifications.getLastNotificationResponseAsync().then((response) => {
    if (!response) return;
    openFromData(response.notification.request.content.data);
  });

  return () => sub.remove();
}
