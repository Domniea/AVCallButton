import { useRoute, type RouteProp } from "@react-navigation/native";
import { useSelector } from "react-redux";

import type { RootState } from "@av/store";
import { useViewMode } from "../hooks/useViewMode";
import { resolveViewMode } from "../lib/viewMode";
import type { MainTabParamList } from "../navigation/types";
import EventDashboard from "./EventDashboard";
import CrewEventDashboard from "./CrewEventDashboard";

/**
 * Post-event tab home: lead vs crew dashboard based on role + stored view mode.
 */
export default function EventHome() {
  const route = useRoute<RouteProp<MainTabParamList, "eventHome">>();
  const { workspaceId } = route.params;
  const { viewMode } = useViewMode();
  const workspaces = useSelector(
    (state: RootState) => state.workspace.workspaces,
  );
  const workspace = workspaces.find((w) => w.workspaceId === workspaceId);
  const mode = resolveViewMode(workspace?.roleRank ?? 0, viewMode);

  return mode === "admin" ? <EventDashboard /> : <CrewEventDashboard />;
}
