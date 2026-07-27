import { clearLastSession, setLastSession } from "../lib/lastSession";

/** Return to workspace picker (pre-tab flow). */
export function navigateToWorkspaceSelector(navigation: {
  navigate: (screen: "workspaceSelector") => void;
}) {
  void clearLastSession();
  navigation.navigate("workspaceSelector");
}

/** Enter post-event tabs on the Event home screen. */
export function navigateToEventHome(
  navigation: {
    navigate: (
      screen: "MainTabs",
      params: {
        screen: "eventHome";
        params: { workspaceId: string; eventId: string };
      },
    ) => void;
  },
  workspaceId: string,
  eventId: string,
) {
  void setLastSession(workspaceId, eventId);
  navigation.navigate("MainTabs", {
    screen: "eventHome",
    params: { workspaceId, eventId },
  });
}
