export type Role = "owner" | "showLead" | "leadTech" | "tech";

export type Action =
  | "workspace:update"
  | "workspace:delete"
  | "workspace:billing"
  | "workspace:invite"
  | "workspace:changeRole"
  | "workspace:removeMember"
  | "show:create"
  | "show:update"
  | "show:delete"
  | "show:assignTech"
  | "show:assignLeadTech"
  | "show:assignShowLead"
  | "show:view";

export const roleRank: Record<Role, number> = {
  tech: 1,
  leadTech: 2,
  showLead: 3,
  owner: 4,
};

export const actionMinimumRank: Record<Action, number> = {
  "workspace:update": 3,
  "workspace:delete": 4,
  "workspace:billing": 4,
  "workspace:invite": 3,
  "workspace:changeRole": 4,
  "workspace:removeMember": 4,

  "show:create": 2,
  "show:update": 2,
  "show:delete": 3,
  "show:assignTech": 2,
  "show:assignLeadTech": 2,
  "show:assignShowLead": 3,
  "show:view": 1,
};

export function hasPermission(
  role: Role,
  action: Action
): boolean {
  const userRank = roleRank[role];
  const requiredRank = actionMinimumRank[action];
  return userRank >= requiredRank;
}