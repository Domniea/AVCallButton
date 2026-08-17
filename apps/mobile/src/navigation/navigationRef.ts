import { createNavigationContainerRef } from "@react-navigation/native";

import type { MainStackParamList } from "./types";

export const navigationRef =
  createNavigationContainerRef<MainStackParamList>();

export function navigateToChatThread(params: {
  threadId: string;
  title?: string;
}) {
  if (!navigationRef.isReady()) return;

  navigationRef.navigate("MainTabs", {
    screen: "chat",
    params: {
      screen: "chatThread",
      params: {
        threadId: params.threadId,
        title: params.title,
      },
    },
  });
}
