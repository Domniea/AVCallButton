export const LEAD_MIN_RANK = 6;

export type ViewMode = "admin" | "crew";

export const VIEW_MODE_STORAGE_KEY = "viewMode";

export function canAccessAdminDash(roleRank: number): boolean {
  return roleRank >= LEAD_MIN_RANK;
}

export function resolveViewMode(
  roleRank: number,
  storedMode: ViewMode | null,
): ViewMode {
  if (!canAccessAdminDash(roleRank)) return "crew";
  return storedMode ?? "admin";
}
