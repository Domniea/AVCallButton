import type { AlertPriority } from "@av/store";

export type RoomSeverity = "urgent" | "pending" | "clear";

export function severityFromPriority(
  priority: AlertPriority | null,
): RoomSeverity {
  if (priority === "HIGH") return "urgent";
  if (priority === "MEDIUM") return "pending";
  return "clear";
}

export function severityLabel(severity: RoomSeverity): string {
  if (severity === "urgent") return "Urgent";
  if (severity === "pending") return "Pending";
  return "Clear";
}

export function severityAccent(severity: RoomSeverity): string {
  if (severity === "urgent") return "#DC2626";
  if (severity === "pending") return "#EA580C";
  return "#16A34A";
}

/** Soft tint behind alert banners / cards (matches AVControl mockups). */
export function severitySoftBg(
  severity: RoomSeverity,
  mode: "light" | "dark" = "light",
): string {
  if (mode === "dark") {
    if (severity === "urgent") return "#3F1515";
    if (severity === "pending") return "#3B2410";
    return "#14301F";
  }
  if (severity === "urgent") return "#FEF2F2";
  if (severity === "pending") return "#FFF7ED";
  return "#F0FDF4";
}

export function severityPillVariant(
  severity: RoomSeverity,
): "danger" | "warning" | "success" {
  if (severity === "urgent") return "danger";
  if (severity === "pending") return "warning";
  return "success";
}

const SEVERITY_RANK: Record<RoomSeverity, number> = {
  urgent: 0,
  pending: 1,
  clear: 2,
};

/** Worst severity wins (urgent > pending > clear). */
export function maxSeverity(
  severities: Array<RoomSeverity | null | undefined>,
): RoomSeverity {
  let best: RoomSeverity = "clear";
  for (const severity of severities) {
    if (!severity) continue;
    if (SEVERITY_RANK[severity] < SEVERITY_RANK[best]) {
      best = severity;
    }
  }
  return best;
}

export function severityStatusCountLabel(
  severity: RoomSeverity,
  activeCount: number,
): string {
  if (severity === "clear" || activeCount <= 0) return "All Clear";
  if (severity === "urgent") {
    return `${activeCount} Active`;
  }
  return `${activeCount} Pending`;
}

export function priorityLabel(priority: AlertPriority): string {
  return priority === "HIGH" ? "Need help now" : "When available";
}

/** Compact relative age for dash cards. */
export function formatAlertAge(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return null;
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
