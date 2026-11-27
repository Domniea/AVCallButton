/**
 * UI lifecycle for an event Overview.
 * Maps EventStatus (+ optional endTime) → pre | live | post.
 */
export type EventPhase = "pre" | "live" | "post";

export type EventPhaseFields = {
  status: string;
  endTime?: string | null;
};

export function resolveEventPhase(
  event: EventPhaseFields,
  /** Dev menu override — when set, skips real status/endTime. */
  override?: EventPhase | null,
): EventPhase {
  if (override) return override;

  const status = event.status?.toUpperCase?.() ?? event.status;

  if (status === "ENDED" || status === "CANCELLED") {
    return "post";
  }

  if (status === "DRAFT") {
    return "pre";
  }

  // ACTIVE (and any unknown status): live unless endTime has passed.
  if (event.endTime) {
    const end = new Date(event.endTime).getTime();
    if (Number.isFinite(end) && Date.now() > end) {
      return "post";
    }
  }

  if (status === "ACTIVE") {
    return "live";
  }

  // Fallback: treat unknown as live so ops UI stays available.
  return "live";
}

export function phaseLabel(phase: EventPhase): string {
  if (phase === "pre") return "Setup";
  if (phase === "post") return "Ended";
  return "Live";
}

export function phasePillVariant(
  phase: EventPhase,
): "primary" | "warning" | "default" {
  if (phase === "pre") return "warning";
  if (phase === "post") return "default";
  return "primary";
}
