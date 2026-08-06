import type { ChatInboxItem, ChatThreadType } from "@av/store";

export function threadTypeLabel(type: ChatThreadType): string {
  switch (type) {
    case "EVENT_GROUP":
      return "Event";
    case "ZONE":
      return "Zone";
    case "DM":
      return "DM";
  }
}

export function threadTitle(
  item: ChatInboxItem,
  emailByUserId: Map<string, string>,
): string {
  switch (item.type) {
    case "EVENT_GROUP":
      return item.eventName ?? "Event chat";
    case "ZONE":
      return item.zoneName ?? "Zone chat";
    case "DM": {
      if (item.otherUserId) {
        return emailByUserId.get(item.otherUserId) ?? "Direct message";
      }
      return "Direct message";
    }
  }
}

export function formatMessagePreview(item: ChatInboxItem): string {
  const body = item.lastMessage?.body?.trim();
  if (!body) return "No messages yet";
  return body;
}

export function formatUpdatedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
