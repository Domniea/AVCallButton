import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  login: undefined;
  signup: undefined;
  signupConfirm: { email: string };
  /** Optional `token` when opened via deep link, e.g. `invite?token=…` */
  invite: { token?: string };
};

/** Shared room detail params (Dash + Alerts stacks). */
export type RoomDetailParams = {
  workspaceId: string;
  eventId: string;
  roomId: string;
};

/** Dash tab stack: event home → zones/staff setup → zone/room detail (tabs stay visible). */
export type DashStackParamList = {
  eventHome: { workspaceId: string; eventId: string };
  eventZones: { workspaceId: string; eventId: string };
  eventStaff: { workspaceId: string; eventId: string };
  zoneDetail: { workspaceId: string; eventId: string; zoneId: string };
  roomDetail: RoomDetailParams;
};

/** Alerts tab: live board → room detail (resolve). */
export type AlertsStackParamList = {
  alertsHome: undefined;
  roomDetail: RoomDetailParams;
};

export type ChatStackParamList = {
  chatHome: undefined;
  chatThread: { threadId: string; title?: string };
  newDm: undefined;
};

/** Tabs only after an event is selected. Settings live in the drawer → MainStack. */
export type MainTabParamList = {
  dash: NavigatorScreenParams<DashStackParamList>;
  alerts: NavigatorScreenParams<AlertsStackParamList>;
  chat: NavigatorScreenParams<ChatStackParamList>;
};

export type MainStackParamList = {
  workspaceSelector: undefined;
  eventSelector: { workspaceId: string };
  crewEventSelector: { workspaceId: string };
  /** Settings (pre-event + via event drawer). */
  settings: undefined;
  /** Developer tools (from Settings). */
  devMenu: undefined;
  /** Optional `token` when opened via deep link while signed in */
  invite: { token?: string };
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
};
