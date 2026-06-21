import type { Event, EventAssignment, Membership, Workspace, WorkspaceRole } from "@prisma/client";

import { MembershipStatus } from "./prismaClient";
import { prisma } from "./prisma";

export type RosterEntryWithRelations = EventAssignment & {
  membership: Membership;
  workspaceRole: WorkspaceRole;
  event: Event & { workspace: Workspace };
};

/** Ensures the user has a confirmed roster row for the event; throws NOT_ON_ROSTER otherwise. */
export async function assertRosterEntry(
  userId: string,
  eventId: string,
): Promise<RosterEntryWithRelations> {
  const entry = await prisma.eventAssignment.findFirst({
    where: {
      eventId,
      membership: {
        userId,
        status: MembershipStatus.ACTIVE,
      },
    },
    include: {
      membership: true,
      workspaceRole: true,
      event: { include: { workspace: true } },
    },
  });

  if (!entry) {
    throw new Error("NOT_ON_ROSTER");
  }

  return entry;
}
