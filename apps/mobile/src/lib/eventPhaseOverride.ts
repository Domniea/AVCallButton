import AsyncStorage from "@react-native-async-storage/async-storage";

import type { EventPhase } from "../event/eventPhase";

export const EVENT_PHASE_OVERRIDE_KEY = "devEventPhaseOverride";

type Listener = (phase: EventPhase | null) => void;

let cached: EventPhase | null | undefined = undefined;
const listeners = new Set<Listener>();

function isEventPhase(value: string): value is EventPhase {
  return value === "pre" || value === "live" || value === "post";
}

function emit(phase: EventPhase | null) {
  for (const listener of listeners) {
    listener(phase);
  }
}

/** Sync read of in-memory cache (undefined = not hydrated yet). */
export function getEventPhaseOverrideCache(): EventPhase | null | undefined {
  return cached;
}

export async function loadEventPhaseOverride(): Promise<EventPhase | null> {
  try {
    const stored = await AsyncStorage.getItem(EVENT_PHASE_OVERRIDE_KEY);
    const next =
      stored && isEventPhase(stored) ? (stored as EventPhase) : null;
    cached = next;
    return next;
  } catch (err) {
    console.error("Failed to load event phase override:", err);
    cached = null;
    return null;
  }
}

export async function setEventPhaseOverride(
  phase: EventPhase | null,
): Promise<void> {
  cached = phase;
  try {
    if (phase == null) {
      await AsyncStorage.removeItem(EVENT_PHASE_OVERRIDE_KEY);
    } else {
      await AsyncStorage.setItem(EVENT_PHASE_OVERRIDE_KEY, phase);
    }
  } catch (err) {
    console.error("Failed to save event phase override:", err);
  }
  emit(phase);
}

export function subscribeEventPhaseOverride(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
