export type RootStackParamList = {
  landing: undefined;
  login: undefined;
  signup: undefined;
  signupConfirm: undefined;
  home: undefined;
  /** Optional `token` when opened via deep link, e.g. `invite?token=…` */
  invite: { token?: string };
  dashboard: undefined;
  workspace: { workspaceId: string };
  event: { workspaceId: string; eventId: string };
};
