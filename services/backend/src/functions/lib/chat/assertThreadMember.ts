import type { ChatThread, ChatThreadMember } from "@prisma/client";

import { MembershipStatus } from "../prismaClient";
import { prisma } from "../prisma";

export type ThreadMemberWithThread = ChatThreadMember & {
  thread: ChatThread;
};

/**
 * Ensures the user has an ACTIVE ChatThreadMember row for this thread.
 * Throws NOT_THREAD_MEMBER otherwise.
 */
export async function assertThreadMember(
  userId: string,
  threadId: string,
): Promise<ThreadMemberWithThread> {
  const member = await prisma.chatThreadMember.findUnique({
    where: {
      threadId_userId: { threadId, userId },
    },
    include: { thread: true },
  });

  if (!member || member.status !== MembershipStatus.ACTIVE) {
    throw new Error("NOT_THREAD_MEMBER");
  }

  return member;
}
