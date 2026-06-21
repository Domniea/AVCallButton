import type { Event, EventAssignment, WorkspaceRole } from "@prisma/client";

import type { RosterEntryWithRelations } from "../assertRosterEntry";
import {
  resolveMyCoverage,
  type ResolveMyCoverageParams,
} from "../resolvers/coverage/resolveMyCoverage";
import { workspaceRoleFields } from "./role";

/** Event identity and schedule — not personal assignment or coverage. */
export function formatEventMeta(event: Event) {
  return {
    id: event.id,
    name: event.name,
    status: event.status,
    location: event.location,
    venue: event.venue,
    startTime: event.startTime?.toISOString() ?? null,
    endTime: event.endTime?.toISOString() ?? null,
  };
}

/** Slim roster assignment for the workspace event list (picker). */
export function formatAssignmentSummary(
  entry: Pick<EventAssignment, "eventRank"> & { workspaceRole: WorkspaceRole },
) {
  return {
    eventRank: entry.eventRank,
    ...workspaceRoleFields(entry.workspaceRole),
  };
}

/** Full roster assignment for the open event detail response. */
export function formatAssignmentDetail(entry: RosterEntryWithRelations) {
  return {
    id: entry.id,
    eventId: entry.eventId,
    membershipId: entry.membershipId,
    eventRank: entry.eventRank,
    ...workspaceRoleFields(entry.workspaceRole),
    assignedBy: entry.assignedBy,
    createdAt: entry.createdAt.toISOString(),
  };
}

/** Zoned coverage (with nested rooms) plus unzoned room coverage. */
export function formatMyCoverage(params: ResolveMyCoverageParams) {
  return resolveMyCoverage(params);
}
