import type { ChatInboxItem, ChatMessage } from "@av/store";

export function applyInboxRealtimeMessage(
  threads: ChatInboxItem[],
  message: ChatMessage,
  myUserId: string | undefined,
): ChatInboxItem[] {
  const index = threads.findIndex((row) => row.id === message.threadId);
  if (index < 0) return threads;

  const prev = threads[index]!;
  if (prev.lastMessage?.id === message.id) return threads;

  const fromMe = myUserId != null && message.senderId === myUserId;
  const next: ChatInboxItem = {
    ...prev,
    lastMessage: {
      ...message,
      editedAt: message.editedAt ?? null,
      deletedAt: message.deletedAt ?? null,
    },
    updatedAt: message.createdAt,
    unreadCount: fromMe ? prev.unreadCount : prev.unreadCount + 1,
  };

  if (index === 0) {
    const copy = threads.slice();
    copy[0] = next;
    return copy;
  }

  return [next, ...threads.slice(0, index), ...threads.slice(index + 1)];
}
