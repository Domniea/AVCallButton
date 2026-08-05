import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  login: undefined;
  signup: undefined;
  signupConfirm: { email: string };
  /** Optional `token` when opened via deep link, e.g. `invite?token=…` */
  invite: { token?: string };
};

/** Dash tab stack: event home → zones → zone/room detail (tabs stay visible). */
export type DashStackParamList = {
  eventHome: { workspaceId: string; eventId: string };
  eventZones: { workspaceId: string; eventId: string };
  zoneDetail: { workspaceId: string; eventId: string; zoneId: string };
  roomDetail: { workspaceId: string; eventId: string; roomId: string };
};

export type ChatStackParamList = {
  chatHome: undefined;
  chatThread: { threadId: string; title?: string };
  newDm: undefined;
};

export type SettingsStackParamList = {
  settingsHome: undefined;
  devMenu: undefined;
};

/** Tabs only after an event is selected. */
export type MainTabParamList = {
  dash: NavigatorScreenParams<DashStackParamList>;
  chat: NavigatorScreenParams<ChatStackParamList>;
  settings: NavigatorScreenParams<SettingsStackParamList>;
};

export type MainStackParamList = {
  workspaceSelector: undefined;
  eventSelector: { workspaceId: string };
  crewEventSelector: { workspaceId: string };
  /** Pre-event settings (also available as a tab after an event is selected). */
  settings: undefined;
  /** Pre-event developer tools (also under the Settings tab stack). */
  devMenu: undefined;
  /** Optional `token` when opened via deep link while signed in */
  invite: { token?: string };
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
};
