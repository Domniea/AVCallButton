import type { Prisma } from "@prisma/client";

import { ChatThreadType, MembershipStatus } from "../prismaClient";
import { prisma } from "../prisma";
import { inboxItemToApi } from "../mappers/chat";

type DbClient = Prisma.TransactionClient | typeof prisma;

/**
 * Inbox threads for a user on an event (ACTIVE memberships only).
 * Includes event group, zone, and DM threads for that eventId.
 */
export async function listInboxThreads(
  db: DbClient,
  params: { userId: string; workspaceId: string; eventId: string },
) {
  const memberships = await db.chatThreadMember.findMany({
    where: {
      userId: params.userId,
      status: MembershipStatus.ACTIVE,
      thread: {
        workspaceId: params.workspaceId,
        eventId: params.eventId,
      },
    },
    include: {
      thread: {
        include: {
          event: { select: { id: true, name: true } },
          zone: { select: { id: true, name: true } },
        },
      },
      lastReadMessage: { select: { id: true, createdAt: true } },
    },
    orderBy: {
      thread: { updatedAt: "desc" },
    },
  });

  const items = await Promise.all(
    memberships.map(async (membership) => {
      const lastMessage = await db.chatMessage.findFirst({
        where: {
          threadId: membership.threadId,
          deletedAt: null,
        },
        orderBy: { createdAt: "desc" },
      });

      const readAfter = membership.lastReadMessage?.createdAt;
      const unreadCount = await db.chatMessage.count({
        where: {
          threadId: membership.threadId,
          deletedAt: null,
          senderId: { not: params.userId },
          ...(readAfter ? { createdAt: { gt: readAfter } } : {}),
        },
      });

      let otherUserId: string | null = null;
      if (membership.thread.type === ChatThreadType.DM) {
        const other = await db.chatThreadMember.findFirst({
          where: {
            threadId: membership.threadId,
            userId: { not: params.userId },
            status: MembershipStatus.ACTIVE,
          },
          select: { userId: true },
        });
        otherUserId = other?.userId ?? null;
      }

      return inboxItemToApi({
        member: membership,
        thread: membership.thread,
        lastMessage,
        unreadCount,
        otherUserId,
      });
    }),
  );

  return items;
}
