import type {
  RosterAssignment,
  RosterPendingInvite,
  RoomCoverage,
  ZoneCoverage,
} from "@av/store";

export type CoverageEntry = RoomCoverage | ZoneCoverage;

export function assignmentSubtitle(a: RosterAssignment) {
  const parts = [a.roleName, `Event rank ${a.eventRank}`].filter(Boolean);
  return parts.join(" · ");
}

export function pendingSubtitle(p: RosterPendingInvite) {
  const parts = [p.roleName, `Event rank ${p.eventRank}`].filter(Boolean);
  return parts.join(" · ");
}

export function roomsForZone(
  rooms: Array<{ id: string; name: string; zoneId: string | null }>,
  zoneId: string,
) {
  return rooms.filter((room) => room.zoneId === zoneId);
}

export function unassignedRooms(
  rooms: Array<{ id: string; name: string; zoneId: string | null }>,
) {
  return rooms.filter((room) => room.zoneId == null);
}

export function coverageLabel(row: CoverageEntry, roster: RosterAssignment[]) {
  const rosterEmail = roster.find(
    (a) => a.membershipId === row.membershipId,
  )?.email;
  const email = row.membership.email ?? rosterEmail ?? "Staff";
  return `${email} · rank ${row.eventRank}`;
}

export function mergeCoverageRow<T extends CoverageEntry>(
  existing: T[],
  row: T,
): T[] {
  if (existing.some((entry) => entry.membershipId === row.membershipId)) {
    return existing;
  }
  return [...existing, row].sort(
    (a, b) =>
      b.eventRank - a.eventRank ||
      String(a.createdAt ?? "").localeCompare(String(b.createdAt ?? "")),
  );
}

export function apiErrorMessage(err: unknown): string {
  if (
    err &&
    typeof err === "object" &&
    "response" in err &&
    err.response &&
    typeof err.response === "object" &&
    "data" in err.response &&
    err.response.data &&
    typeof err.response.data === "object" &&
    "error" in err.response.data &&
    typeof err.response.data.error === "string"
  ) {
    return err.response.data.error;
  }
  return "Could not update coverage. Try again.";
}

export type RemovingCoverage = {
  kind: "room" | "zone";
  targetId: string;
  membershipId: string;
};

export function removingMembershipIdFor(
  removing: RemovingCoverage | null,
  kind: "room" | "zone",
  targetId: string,
): string | null {
  if (!removing || removing.kind !== kind || removing.targetId !== targetId) {
    return null;
  }
  return removing.membershipId;
}
