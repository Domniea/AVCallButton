import { clearLastSession, setLastSession } from "../lib/lastSession";

/** Return to workspace picker (pre-tab flow). */
export function navigateToWorkspaceSelector(navigation: {
  navigate: (screen: "workspaceSelector") => void;
}) {
  void clearLastSession();
  navigation.navigate("workspaceSelector");
}

type EventHomeLanding = "dash" | "alerts";

/** Enter post-event tabs. Crew flows land on Alerts; admin/setup on Event. */
export function navigateToEventHome(
  navigation: {
    navigate: (
      screen: "MainTabs",
      params:
        | {
            screen: "dash";
            params: {
              screen: "eventHome";
              params: { workspaceId: string; eventId: string };
            };
          }
        | { screen: "alerts" },
    ) => void;
  },
  workspaceId: string,
  eventId: string,
  landing: EventHomeLanding = "dash",
) {
  void setLastSession(workspaceId, eventId).catch((err) => {
    console.error("Failed to persist last session:", err);
  });
  if (landing === "alerts") {
    navigation.navigate("MainTabs", { screen: "alerts" });
    return;
  }
  navigation.navigate("MainTabs", {
    screen: "dash",
    params: {
      screen: "eventHome",
      params: { workspaceId, eventId },
    },
  });
}
