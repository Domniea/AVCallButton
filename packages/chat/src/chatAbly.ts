import type { ChatMessage } from "@av/store";

/** Must match backend `CHAT_MESSAGE_CREATED_EVENT`. */
export const CHAT_MESSAGE_CREATED_EVENT = "message.created";

export function chatThreadChannelName(threadId: string): string {
  return `thread:${threadId}`;
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;
  const msg = value as Record<string, unknown>;
  return (
    typeof msg.id === "string" &&
    typeof msg.threadId === "string" &&
    typeof msg.senderId === "string" &&
    typeof msg.body === "string" &&
    typeof msg.createdAt === "string"
  );
}

export function parseAblyMessageData(data: unknown): ChatMessage | null {
  if (isChatMessage(data)) return data;
  if (typeof data === "string") {
    try {
      const parsed: unknown = JSON.parse(data);
      return isChatMessage(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function normalizeAblyChatMessage(message: ChatMessage): ChatMessage {
  return {
    ...message,
    editedAt: message.editedAt ?? null,
    deletedAt: message.deletedAt ?? null,
  };
}
