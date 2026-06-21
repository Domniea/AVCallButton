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
  crewWorkspace: { workspaceId: string };
  crewEvent: { workspaceId: string; eventId: string };
};
