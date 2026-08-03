import type { ChatThreadMember, Prisma } from "@prisma/client";

import { prisma } from "../prisma";

type DbClient = Prisma.TransactionClient | typeof prisma;

/**
 * Advance the member's last-read cursor to `messageId` (must belong to the thread).
 * Does not move the cursor backwards. Idempotent.
 */
export async function markThreadRead(
  db: DbClient,
  params: { threadId: string; userId: string; messageId: string },
): Promise<ChatThreadMember> {
  const message = await db.chatMessage.findFirst({
    where: { id: params.messageId, threadId: params.threadId },
    select: { id: true, createdAt: true },
  });
  if (!message) {
    throw new Error("MESSAGE_NOT_FOUND");
  }

  const member = await db.chatThreadMember.findUnique({
    where: {
      threadId_userId: {
        threadId: params.threadId,
        userId: params.userId,
      },
    },
    include: {
      lastReadMessage: { select: { createdAt: true } },
    },
  });
  if (!member) {
    throw new Error("NOT_THREAD_MEMBER");
  }

  if (
    member.lastReadMessage &&
    message.createdAt.getTime() <= member.lastReadMessage.createdAt.getTime()
  ) {
    const { lastReadMessage: _lastReadMessage, ...row } = member;
    return row;
  }

  return db.chatThreadMember.update({
    where: { id: member.id },
    data: { lastReadMessageId: message.id },
  });
}
