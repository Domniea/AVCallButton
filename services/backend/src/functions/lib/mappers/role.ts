import type { WorkspaceRole } from "@prisma/client";

import { roleKeyFromRank } from "../permissions";

export function workspaceRoleFields(role: WorkspaceRole) {
  return {
    role: roleKeyFromRank(role.rank),
    roleRank: role.rank,
    roleName: role.name,
  };
}
