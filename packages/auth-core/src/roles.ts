export const ROLES = {
  OWNER: "owner",
  ADMIN: "admin",
  LEAD_TECH: "lead_tech",
  TECH: "tech",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
