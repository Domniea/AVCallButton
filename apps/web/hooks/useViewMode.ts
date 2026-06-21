"use client";

import { useCallback, useEffect, useState } from "react";

import {
  VIEW_MODE_STORAGE_KEY,
  type ViewMode,
} from "@/lib/viewMode";

export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>("admin");

  useEffect(() => {
    const stored = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    if (stored === "admin" || stored === "crew") {
      setViewModeState(stored);
    }
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  }, []);

  return { viewMode, setViewMode };
}
