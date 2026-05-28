import { prisma } from "../prisma";

/** Returns deduped room ids, or null if invalid. Accepts string[] or { id: string }[]. */
export function parseRoomIds(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const ids: string[] = [];
  for (const item of value) {
    if (typeof item === "string") {
      if (!item.trim()) return null;
      ids.push(item.trim());
      continue;
    }
    if (typeof item === "object" && item !== null) {
      const id = (item as { id?: unknown }).id;
      if (typeof id !== "string" || !id.trim()) return null;
      ids.push(id.trim());
      continue;
    }
    return null;
  }
  return [...new Set(ids)];
}

export async function validateRoomIdsForEvent(
  eventId: string,
  roomIds: string[],
): Promise<string | null> {
  if (roomIds.length === 0) return null;
  const found = await prisma.eventRoom.findMany({
    where: { eventId, id: { in: roomIds } },
    select: { id: true },
  });
  const foundIds = new Set(found.map((r) => r.id));
  const invalidIds = roomIds.filter((id) => !foundIds.has(id));
  if (invalidIds.length === 0) return null;
  return `Invalid roomIds for event ${eventId}: ${invalidIds.join(", ")}`;
}
