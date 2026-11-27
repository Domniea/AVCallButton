import React, { useState } from "react";
import { Text, VStack } from "../../../components/ui/layout";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import type { RootState } from "@av/store";
import { BaseBottomSheet } from "../../../components/BaseBottomSheet";
import { BaseButton } from "../../../components/BaseButton";
import { BaseCard } from "../../../components/BaseCard";
import { BasePill } from "../../../components/BasePill";
import { ScreenLayout } from "../../../components/ScreenLayout";
import { ViewModeToggle } from "../../components/ViewModeToggle";
import { useThemeColors } from "../../../hooks/useThemeColors";
import { useEventPhaseOverride } from "../../hooks/useEventPhaseOverride";
import { useViewMode } from "../../hooks/useViewMode";
import { phaseLabel, type EventPhase } from "../../event/eventPhase";
import { canAccessAdminDash } from "../../lib/viewMode";
import type { MainStackParamList } from "../../navigation/types";
import { navigateToWorkspaceSelector } from "../../navigation/navigateToWorkspaceSelector";

type DevMenuNav = NativeStackNavigationProp<MainStackParamList, "devMenu">;

const PHASE_OPTIONS: Array<{ key: string; label: string; value: EventPhase | null }> =
  [
    { key: "auto", label: "Auto (use real event status)", value: null },
    { key: "pre", label: "Setup (pre)", value: "pre" },
    { key: "live", label: "Live", value: "live" },
    { key: "post", label: "Ended (post)", value: "post" },
  ];

/**
 * Testing-only tools. View mode is saved to AsyncStorage; after toggling we
 * return to the workspace picker so the next open uses admin vs crew routes.
 */
export default function DevMenu() {
  const navigation = useNavigation<DevMenuNav>();
  const { muted, text } = useThemeColors();
  const { viewMode, setViewMode } = useViewMode();
  const { override, setPhaseOverride } = useEventPhaseOverride();
  const [phaseSheetOpen, setPhaseSheetOpen] = useState(false);

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
    <>
      <ScreenLayout
        title="Developer"
        subtitle="Testing tools"
        showBack
        showMenu={false}
        maxW="640"
      >
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

        <BaseCard title="Event phase override" titleAlign="start" variant="outline">
          <VStack space={3} alignItems="stretch">
            <Text fontSize="sm" color={muted}>
              Temporarily force Overview into Setup, Live, or Ended without
              changing the real event status. Cleared with Auto.
            </Text>
            <Text fontSize="sm" color={text}>
              {override
                ? `Current: ${phaseLabel(override)} (override)`
                : "Current: Auto (real event status)"}
            </Text>
            {override ? (
              <BasePill label={`Override · ${phaseLabel(override)}`} variant="danger" />
            ) : (
              <BasePill label="Using real status" variant="outline" />
            )}
            <BaseButton
              title="Choose phase…"
              variety="secondary"
              onPress={() => setPhaseSheetOpen(true)}
            />
          </VStack>
        </BaseCard>
      </ScreenLayout>

      <BaseBottomSheet
        isOpen={phaseSheetOpen}
        onClose={() => setPhaseSheetOpen(false)}
        title="Event phase override"
        items={PHASE_OPTIONS.map((option) => ({
          key: option.key,
          label:
            option.value === override || (option.value == null && override == null)
              ? `✓ ${option.label}`
              : option.label,
          onPress: () => {
            void setPhaseOverride(option.value);
          },
        }))}
      />
    </>
  );
}
