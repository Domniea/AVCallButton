import type { ChatMessage } from "@av/store";

export function mergeMessagesById(
  existing: ChatMessage[],
  incoming: ChatMessage[],
  mode: "prepend" | "append" | "replace",
): ChatMessage[] {
  if (mode === "replace") return incoming;
  const map = new Map<string, ChatMessage>();
  const ordered =
    mode === "prepend" ? [...incoming, ...existing] : [...existing, ...incoming];
  for (const msg of ordered) {
    if (!map.has(msg.id)) map.set(msg.id, msg);
  }
  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}
