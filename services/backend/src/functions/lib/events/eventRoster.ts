import { prisma } from "../prisma";

/** Lookup a single roster row; null if not on the event roster. */
export async function findEventRosterAssignment(
  eventId: string,
  membershipId: string,
) {
  return prisma.eventAssignment.findFirst({
    where: { eventId, membershipId },
    select: { id: true, eventRank: true },
  });
}
