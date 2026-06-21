import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  VIEW_MODE_STORAGE_KEY,
  type ViewMode,
} from "../lib/viewMode";

export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>("admin");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void AsyncStorage.getItem(VIEW_MODE_STORAGE_KEY).then((stored) => {
      if (stored === "admin" || stored === "crew") {
        setViewModeState(stored);
      }
      setLoaded(true);
    });
  }, []);

  const setViewMode = useCallback(async (mode: ViewMode) => {
    setViewModeState(mode);
    await AsyncStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  }, []);

  return { viewMode, setViewMode, loaded };
}
