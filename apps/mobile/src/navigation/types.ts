import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  login: undefined;
  signup: undefined;
  signupConfirm: { email: string };
  /** Optional `token` when opened via deep link, e.g. `invite?token=…` */
  invite: { token?: string };
};

export type MainTabParamList = {
  dashboard: undefined;
  home: undefined;
};

export type MainStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  /** Optional `token` when opened via deep link while signed in */
  invite: { token?: string };
  workspace: { workspaceId: string };
  event: { workspaceId: string; eventId: string };
  eventZones: { workspaceId: string; eventId: string };
  zoneDetail: { workspaceId: string; eventId: string; zoneId: string };
  roomDetail: { workspaceId: string; eventId: string; roomId: string };
  crewWorkspace: { workspaceId: string };
  crewEvent: { workspaceId: string; eventId: string };
};
