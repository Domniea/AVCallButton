import type { ChatMessage, ChatThread, ChatThreadMember } from "@prisma/client";

export function chatMessageToApi(message: ChatMessage) {
  return {
    id: message.id,
    threadId: message.threadId,
    senderId: message.senderId,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    editedAt: message.editedAt?.toISOString() ?? null,
    deletedAt: message.deletedAt?.toISOString() ?? null,
  };
}

export function chatThreadToApi(thread: ChatThread) {
  return {
    id: thread.id,
    type: thread.type,
    workspaceId: thread.workspaceId,
    eventId: thread.eventId,
    zoneId: thread.zoneId,
    dmKey: thread.dmKey,
    createdAt: thread.createdAt.toISOString(),
    updatedAt: thread.updatedAt.toISOString(),
  };
}

type InboxThread = ChatThread & {
  event: { id: string; name: string } | null;
  zone: { id: string; name: string } | null;
};

export function inboxItemToApi(params: {
  member: ChatThreadMember;
  thread: InboxThread;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  otherUserId: string | null;
}) {
  const { member, thread, lastMessage, unreadCount, otherUserId } = params;

  return {
    id: thread.id,
    type: thread.type,
    workspaceId: thread.workspaceId,
    eventId: thread.eventId,
    eventName: thread.event?.name ?? null,
    zoneId: thread.zoneId,
    zoneName: thread.zone?.name ?? null,
    otherUserId,
    lastMessage: lastMessage ? chatMessageToApi(lastMessage) : null,
    lastReadMessageId: member.lastReadMessageId,
    unreadCount,
    updatedAt: thread.updatedAt.toISOString(),
  };
}
