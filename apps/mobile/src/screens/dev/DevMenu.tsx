import React from "react";
import { Text } from "native-base";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootState } from "@av/store";
import { BaseCard } from "../../../components/BaseCard";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { ViewModeToggle } from "../../components/ViewModeToggle";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useViewMode } from "../../hooks/useViewMode";
import { canAccessAdminDash } from "../../lib/viewMode";
import type {
  MainStackParamList,
  SettingsStackParamList,
} from "../../navigation/types";
import { navigateToWorkspaceSelector } from "../../navigation/navigateToWorkspaceSelector";

type DevMenuNav = CompositeNavigationProp<
  NativeStackNavigationProp<SettingsStackParamList, "devMenu">,
  NativeStackNavigationProp<MainStackParamList>
>;

/**
 * Testing-only tools. View mode is saved to AsyncStorage; after toggling we
 * return to the workspace picker so the next open uses admin vs crew routes.
 */
export default function DevMenu() {
  const navigation = useNavigation<DevMenuNav>();
  const { muted } = useThemeColors();
  const { viewMode, setViewMode } = useViewMode();
  const workspaces = useSelector(
    (state: RootState) => state.workspace.workspaces,
  );

  const canToggleViewMode = workspaces.some((ws) =>
    canAccessAdminDash(ws.roleRank),
  );

  const onToggleViewMode = async () => {
    const next = viewMode === "admin" ? "crew" : "admin";
    await setViewMode(next);
    navigateToWorkspaceSelector(navigation);
  };

  return (
    <ScreenLayout subtitle="Testing tools" maxW="640">
      <BaseCard title="View mode" titleAlign="start" variant="outline">
        <Text fontSize="sm" color={muted} mb={4}>
          Prefer lead (admin) or crew when opening a workspace. After switching,
          pick a workspace again so the matching event list loads.
        </Text>
        {canToggleViewMode ? (
          <ViewModeToggle
            viewMode={viewMode}
            onToggle={() => void onToggleViewMode()}
          />
        ) : (
          <Text fontSize="sm" color={muted}>
            Available when you have lead-rank access in at least one workspace.
          </Text>
        )}
      </BaseCard>
    </ScreenLayout>
  );
}
