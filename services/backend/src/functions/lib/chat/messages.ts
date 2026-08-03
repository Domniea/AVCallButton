import type { ChatMessage, Prisma } from "@prisma/client";

import { prisma } from "../prisma";

type DbClient = Prisma.TransactionClient | typeof prisma;

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;
const BODY_MIN = 1;
const BODY_MAX = 4000;

export function parseMessageLimit(raw: string | undefined): number | null {
  if (raw === undefined || raw === "") return DEFAULT_LIMIT;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > MAX_LIMIT) return null;
  return n;
}

export function parseMessageBody(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length < BODY_MIN || trimmed.length > BODY_MAX) return null;
  return trimmed;
}

/**
 * List non-deleted messages for a thread.
 * - Default / `before`: newest page (then returned oldest→newest).
 * - `after`: messages newer than cursor (polling), oldest→newest.
 */
export async function listThreadMessages(
  db: DbClient,
  params: {
    threadId: string;
    limit: number;
    before?: string;
    after?: string;
  },
): Promise<{ messages: ChatMessage[]; hasMore: boolean }> {
  if (params.before && params.after) {
    throw new Error("INVALID_CURSOR");
  }

  let createdAtFilter: Prisma.DateTimeFilter | undefined;

  if (params.before) {
    const cursor = await db.chatMessage.findFirst({
      where: { id: params.before, threadId: params.threadId },
      select: { createdAt: true },
    });
    if (!cursor) throw new Error("INVALID_BEFORE_CURSOR");
    createdAtFilter = { lt: cursor.createdAt };
  } else if (params.after) {
    const cursor = await db.chatMessage.findFirst({
      where: { id: params.after, threadId: params.threadId },
      select: { createdAt: true },
    });
    if (!cursor) throw new Error("INVALID_AFTER_CURSOR");
    createdAtFilter = { gt: cursor.createdAt };
  }

  const descending = !params.after;
  const rows = await db.chatMessage.findMany({
    where: {
      threadId: params.threadId,
      deletedAt: null,
      ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
    },
    orderBy: { createdAt: descending ? "desc" : "asc" },
    take: params.limit + 1,
  });

  const hasMore = rows.length > params.limit;
  const page = hasMore ? rows.slice(0, params.limit) : rows;
  const messages = descending ? page.reverse() : page;

  return { messages, hasMore };
}

export async function createThreadMessage(
  db: DbClient,
  params: { threadId: string; senderId: string; body: string },
): Promise<ChatMessage> {
  const message = await db.chatMessage.create({
    data: {
      threadId: params.threadId,
      senderId: params.senderId,
      body: params.body,
    },
  });

  await db.chatThread.update({
    where: { id: params.threadId },
    data: { updatedAt: new Date() },
  });

  return message;
}
