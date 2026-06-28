import type { MembershipStatus as MembershipStatusType } from "@prisma/client";

import { prisma } from "../../prisma";
import { MembershipStatus } from "../../prismaClient";
import { roleRank } from "../../permissions";

export type AlertRecipientSource = "room" | "zone" | "lead";

export type AlertRecipient = {
  membershipId: string;
  userId: string;
  source: AlertRecipientSource;
};

export type ResolveAlertRecipientsParams = {
  eventId: string;
  roomId: string;
  zoneId: string | null;
};

type CoverageRow = {
  membershipId: string;
  membership: { userId: string; status: MembershipStatusType };
};

const membershipQueryParams = {
  membershipId: true,
  membership: { select: { userId: true, status: true } },
} as const;

/** Union room + zone coverage and event leads; dedupe by membershipId (room wins over zone over lead). */
export function mergeAlertRecipients(input: {
  room: CoverageRow[];
  zone: CoverageRow[];
  lead: CoverageRow[];
}): AlertRecipient[] {
  const byMembership = new Map<string, AlertRecipient>();

  const add = (row: CoverageRow, source: AlertRecipientSource) => {
    if (row.membership.status !== MembershipStatus.ACTIVE) return;
    if (byMembership.has(row.membershipId)) return;
    byMembership.set(row.membershipId, {
      membershipId: row.membershipId,
      userId: row.membership.userId,
      source,
    });
  };

  for (const row of input.room) add(row, "room");
  for (const row of input.zone) add(row, "zone");
  for (const row of input.lead) add(row, "lead");

  return [...byMembership.values()];
}

/** Who should be notified for a help alert in this room. */
export async function resolveAlertRecipients(
  params: ResolveAlertRecipientsParams,
): Promise<AlertRecipient[]> {
  const { eventId, roomId, zoneId } = params;

  const [room, zone, lead] = await Promise.all([
    prisma.eventRoomCoverage.findMany({
      where: { roomId },
      select: membershipQueryParams,
    }),
    zoneId
      ? prisma.eventZoneCoverage.findMany({
          where: { zoneId },
          select: membershipQueryParams,
        })
      : Promise.resolve([]),
    prisma.eventAssignment.findMany({
      where: {
        eventId,
        eventRank: { gte: roleRank.lead },
      },
      select: membershipQueryParams,
    }),
  ]);

  return mergeAlertRecipients({ room, zone, lead });
}
