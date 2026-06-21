import React from "react";

import { BaseButton } from "../../components/BaseButton";
import type { ViewMode } from "../lib/viewMode";

type ViewModeToggleProps = {
  viewMode: ViewMode;
  onToggle: () => void;
};

export function ViewModeToggle({ viewMode, onToggle }: ViewModeToggleProps) {
  return (
    <BaseButton
      title={viewMode === "admin" ? "Switch to crew view" : "Switch to admin view"}
      variety="tertiary"
      btnWidth="auto"
      onPress={onToggle}
    />
  );
}
