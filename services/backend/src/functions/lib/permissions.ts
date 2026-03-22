export type Role = "owner" | "manager" | "lead" | "crew" | "guest";

export type Action =
  | "workspace:update"
  | "workspace:delete"
  | "workspace:billing"
  | "workspace:invite"
  | "workspace:deleteInvite"
  | "workspace:changeRole"
  | "workspace:viewMembers"
  | "workspace:removeMember"
  | "show:create"
  | "show:update"
  | "show:delete"
  | "show:assignTech"
  | "show:assignLeadTech"
  | "show:assignShowLead"
  | "show:view";

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
  
    "show:create": 6,
    "show:update": 6,
    "show:delete": 8,
    "show:assignTech": 6,
    "show:assignLeadTech": 6,
    "show:assignShowLead": 8,
    "show:view": 4,
  };

export function hasPermission(role: Role, action: Action): boolean {
  const userRank = roleRank[role];
  const requiredRank = actionMinimumRank[action];
  return userRank >= requiredRank;
}
