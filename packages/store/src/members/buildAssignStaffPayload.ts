import type { AssignStaffData } from "../api/roster.api";
import type { MemberEmailLookupState } from "./useMemberEmailLookup";

type AssignStaffFormValues = {
  email: string;
  eventRank: number;
  workspaceRoleRank?: number;
};

export function buildAssignStaffPayload(
  data: AssignStaffFormValues,
  lookup: MemberEmailLookupState,
): { payload: AssignStaffData | null; error: string | null } {
  if (lookup.status === "idle" || lookup.status === "loading") {
    return {
      payload: null,
      error: "Enter a valid email and wait for the lookup to finish.",
    };
  }

  if (lookup.status === "error") {
    return { payload: null, error: lookup.message };
  }

  const payload: AssignStaffData = {
    email: data.email.trim(),
    eventRank: data.eventRank,
  };

  if (lookup.status === "not_found") {
    const rank = data.workspaceRoleRank;
    if (rank == null || rank <= 0) {
      return { payload: null, error: "Select a workspace role." };
    }
    payload.workspaceRoleRank = rank;
  }

  return { payload, error: null };
}
