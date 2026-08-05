/**
 * Client-side mirror of backend `services/backend/src/functions/lib/permissions.ts`.
 * Keep action ranks aligned with that file when changing either side.
 */

export type Role = "owner" | "manager" | "lead" | "crew" | "guest";

export const ROLES: readonly Role[] = [
  "guest",
  "crew",
  "lead",
  "manager",
  "owner",
] as const;

export const roleRank: Record<Role, number> = {
  guest: 2,
  crew: 4,
  lead: 6,
  manager: 8,
  owner: 10,
};

export type Action =
  | "workspace:update"
  | "workspace:delete"
  | "workspace:billing"
  | "workspace:invite"
  | "workspace:deleteInvite"
  | "workspace:changeRole"
  | "workspace:viewMembers"
  | "workspace:removeMember"
  | "event:create"
  | "event:update"
  | "event:delete"
  | "event:assignStaff"
  | "event:view"
  | "event:viewRoster";

export const actionMinimumRank: Record<Action, number> = {
  "workspace:update": 8,
  "workspace:delete": 10,
  "workspace:billing": 10,
  "workspace:invite": 8,
  "workspace:deleteInvite": 8,
  "workspace:changeRole": 10,
  "workspace:viewMembers": 8,
  "workspace:removeMember": 10,
  "event:create": 6,
  "event:update": 6,
  "event:delete": 8,
  "event:assignStaff": 6,
  "event:view": 4,
  "event:viewRoster": 4,
};

export function hasPermissionForRank(
  userRank: number,
  action: Action,
): boolean {
  return userRank >= actionMinimumRank[action];
}

/** `GET /events/:id/roster` — crew+ (same floor as `event:view` for now). */
export function canViewRoster(roleRank: number): boolean {
  return hasPermissionForRank(roleRank, "event:viewRoster");
}
