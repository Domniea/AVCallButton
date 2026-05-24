import type { Event, Membership, Workspace, WorkspaceRole } from "@prisma/client";

import { roleKeyFromRank } from "../permissions";
import { workspaceRoleFields } from "./role";

export type MembershipWithWorkspaceSummary = Membership & {
  workspace: Workspace & { _count: { events: number } };
  workspaceRole: WorkspaceRole;
};

export type MembershipWithDashboardWorkspace = Membership & {
  workspace: Workspace & {
    events: Event[];
    _count: { events: number };
  };
  workspaceRole: WorkspaceRole;
};

export function membershipToWorkspaceSummary(m: MembershipWithWorkspaceSummary) {
  return {
    workspaceId: m.workspace.id,
    name: m.workspace.name,
    type: m.workspace.type,
    createdAt: m.workspace.createdAt,
    eventCount: m.workspace._count.events,
    ...workspaceRoleFields(m.workspaceRole),
  };
}

export function membershipToDashboardWorkspace(
  m: MembershipWithDashboardWorkspace,
) {
  return {
    workspaceId: m.workspace.id,
    name: m.workspace.name,
    type: m.workspace.type,
    role: roleKeyFromRank(m.workspaceRole.rank),
    eventCount: m.workspace._count.events,
    recentEvents: m.workspace.events,
  };
}
