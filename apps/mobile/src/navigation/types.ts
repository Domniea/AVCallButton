export type RootStackParamList = {
  login: undefined;
  signup: undefined;
  signupConfirm: undefined;
  home: undefined;
  /** Optional `token` when opened via deep link, e.g. `invite?token=…` */
  invite: { token?: string };
  dashboard: undefined;
  workspace: { workspaceId: string };
  event: { workspaceId: string; eventId: string };
  eventZones: { workspaceId: string; eventId: string };
  zoneDetail: { workspaceId: string; eventId: string; zoneId: string };
  roomDetail: { workspaceId: string; eventId: string; roomId: string };
  crewWorkspace: { workspaceId: string };
  crewEvent: { workspaceId: string; eventId: string };
};
