import type { ScheduledHandler } from "aws-lambda";
import { EventInviteStatus, InviteStatus } from "@prisma/client";

import { prisma } from "../lib/prisma";

/**
 * EventBridge schedule: mark overdue workspace invites and stale roster queue rows expired.
 */
export const handler: ScheduledHandler = async () => {
  const now = new Date();

  const { inviteCount, eventInviteCount } = await prisma.$transaction(async (tx) => {
    const invites = await tx.invite.updateMany({
      where: {
        status: InviteStatus.PENDING,
        expiresAt: { lt: now },
      },
      data: { status: InviteStatus.EXPIRED },
    });

    const eventInvites = await tx.eventInvite.updateMany({
      where: {
        status: EventInviteStatus.PENDING,
        invite: {
          status: { in: [InviteStatus.EXPIRED, InviteStatus.CANCELED] },
        },
      },
      data: { status: EventInviteStatus.EXPIRED },
    });

    return {
      inviteCount: invites.count,
      eventInviteCount: eventInvites.count,
    };
  });

  console.log(
    JSON.stringify({
      job: "expireInvites",
      inviteCount,
      eventInviteCount,
      at: now.toISOString(),
    }),
  );
};
