import { useCallback, useEffect, useState } from "react";

import type { EventPhase } from "../event/eventPhase";
import {
  getEventPhaseOverrideCache,
  loadEventPhaseOverride,
  setEventPhaseOverride,
  subscribeEventPhaseOverride,
} from "../lib/eventPhaseOverride";

/** Dev-only temporary Overview phase override (AsyncStorage + live subscribers). */
export function useEventPhaseOverride() {
  const [override, setOverride] = useState<EventPhase | null>(
    () => getEventPhaseOverrideCache() ?? null,
  );
  const [ready, setReady] = useState(
    () => getEventPhaseOverrideCache() !== undefined,
  );

  useEffect(() => {
    let active = true;
    void loadEventPhaseOverride().then((next) => {
      if (!active) return;
      setOverride(next);
      setReady(true);
    });
    return subscribeEventPhaseOverride((next) => {
      setOverride(next);
      setReady(true);
    });
  }, []);

  const setPhaseOverride = useCallback(async (phase: EventPhase | null) => {
    await setEventPhaseOverride(phase);
  }, []);

  return { override, setPhaseOverride, ready };
}
