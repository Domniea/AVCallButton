import {
  canViewRoster,
  hasPermissionForRank,
  roleRank,
} from "@av/store";

export const LEAD_MIN_RANK = roleRank.lead;

export const EVENT_DELETE_MIN_RANK = roleRank.manager;

export type ViewMode = "admin" | "crew";

export const VIEW_MODE_STORAGE_KEY = "viewMode";

/** Lead+ admin dashboard (same floor as `event:create` / assign staff). */
export function canAccessAdminDash(userRoleRank: number): boolean {
  return hasPermissionForRank(userRoleRank, "event:create");
}

export function canDeleteEvent(userRoleRank: number): boolean {
  return hasPermissionForRank(userRoleRank, "event:delete");
}

export { canViewRoster };

export function resolveViewMode(
  userRoleRank: number,
  storedMode: ViewMode | null,
): ViewMode {
  if (!canAccessAdminDash(userRoleRank)) return "crew";
  return storedMode ?? "admin";
}
