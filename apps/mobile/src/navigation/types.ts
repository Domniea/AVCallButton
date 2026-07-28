import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  login: undefined;
  signup: undefined;
  signupConfirm: { email: string };
  /** Optional `token` when opened via deep link, e.g. `invite?token=…` */
  invite: { token?: string };
};

/** Tabs only after an event is selected. */
export type MainTabParamList = {
  eventHome: { workspaceId: string; eventId: string };
  chat: undefined;
  settings: undefined;
};

export type MainStackParamList = {
  workspaceSelector: undefined;
  eventSelector: { workspaceId: string };
  crewEventSelector: { workspaceId: string };
  /** Pre-event settings (also available as a tab after an event is selected). */
  settings: undefined;
  /** Testing tools (admin/crew view switch, etc.). */
  devMenu: undefined;
  /** Optional `token` when opened via deep link while signed in */
  invite: { token?: string };
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  eventZones: { workspaceId: string; eventId: string };
  zoneDetail: { workspaceId: string; eventId: string; zoneId: string };
  roomDetail: { workspaceId: string; eventId: string; roomId: string };
};
