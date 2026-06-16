/** Workspace tiers assignable when inviting someone via event roster (matches backend ranks). */
export const ASSIGN_WORKSPACE_ROLE_OPTIONS = [
  { label: "Guest", rank: 2 },
  { label: "Crew", rank: 4 },
  { label: "Lead", rank: 6 },
  { label: "Manager", rank: 8 },
] as const;
