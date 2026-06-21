"use client";

import { BaseButton } from "@/components/reusable/BaseButton";
import type { ViewMode } from "@/lib/viewMode";

type ViewModeToggleProps = {
  viewMode: ViewMode;
  onToggle: () => void;
};

export function ViewModeToggle({ viewMode, onToggle }: ViewModeToggleProps) {
  return (
    <BaseButton variety="tertiary" btnWidth="auto" onClick={onToggle}>
      {viewMode === "admin" ? "Switch to crew view" : "Switch to admin view"}
    </BaseButton>
  );
}
