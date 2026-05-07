export type Role = "owner" | "manager" | "lead" | "crew" | "guest";

/** Canonical role keys for API bodies (invites, PATCH role). Order = lowest → highest rank. */
export const ROLES: readonly Role[] = [
  "guest",
  "crew",
  "lead",
  "manager",
  "owner",
] as const;

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

/** Map `WorkspaceRole.rank` to API role key when it matches a seeded tier; otherwise null. */
export function roleKeyFromRank(rank: number): Role | null {
  for (const r of ROLES) {
    if (roleRank[r] === rank) return r;
  }
  return null;
}

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
  | "event:view";

export const roleRank: Record<Role, number> = {
  guest: 2,
  crew: 4,
  lead: 6,
  manager: 8,
  owner: 10,
};

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
};

/** Permission check using the member's numeric rank from `WorkspaceRole.rank`. */
export function hasPermissionForRank(
  userRank: number,
  action: Action,
): boolean {
  const requiredRank = actionMinimumRank[action];
  return userRank >= requiredRank;
}

/** Legacy: map string role → rank (e.g. invites until they use workspace roles). */
export function hasPermission(role: Role, action: Action): boolean {
  return hasPermissionForRank(roleRank[role], action);
}
