import { Rest, type capabilityOp } from "ably";

import { MembershipStatus } from "../prismaClient";
import { prisma } from "../prisma";

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

export function chatThreadChannelName(threadId: string): string {
  return `thread:${threadId}`;
}

function getAblyRest(): Rest {
  const key = process.env.ABLY_API_KEY?.trim();
  if (!key) {
    throw new Error("ABLY_NOT_CONFIGURED");
  }
  return new Rest({ key });
}


export async function resolveAblySubscribeChannels(params: {
  userId: string;
  eventId: string;
  threadId?: string;
}): Promise<string[]> {
  if (params.threadId) {
    const member = await prisma.chatThreadMember.findUnique({
      where: {
        threadId_userId: {
          threadId: params.threadId,
          userId: params.userId,
        },
      },
      include: { thread: { select: { eventId: true } } },
    });
    if (
      !member ||
      member.status !== MembershipStatus.ACTIVE ||
      member.thread.eventId !== params.eventId
    ) {
      throw new Error("NOT_THREAD_MEMBER");
    }
    return [chatThreadChannelName(params.threadId)];
  }

  const memberships = await prisma.chatThreadMember.findMany({
    where: {
      userId: params.userId,
      status: MembershipStatus.ACTIVE,
      thread: { eventId: params.eventId },
    },
    select: { threadId: true },
  });

  return memberships.map((m) => chatThreadChannelName(m.threadId));
}

/** Signed Ably TokenRequest for client Realtime auth (subscribe-only). */
export async function createChatAblyTokenRequest(params: {
  userId: string;
  channelNames: string[];
}) {
  if (params.channelNames.length === 0) {
    throw new Error("NO_CHAT_CHANNELS");
  }

  const capability: { [key: string]: capabilityOp[] } = {};
  for (const name of params.channelNames) {
    capability[name] = ["subscribe"];
  }

  const rest = getAblyRest();
  return rest.auth.createTokenRequest({
    clientId: params.userId,
    capability,
    ttl: TOKEN_TTL_MS,
  });
}

export type ChatMessageAblyPayload = {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
};

/** Event name clients should subscribe to on `thread:{id}` channels. */
export const CHAT_MESSAGE_CREATED_EVENT = "message.created";

/**
 * Fan out a new message on Ably. Never throws — Postgres is already the source of truth.
 */
export async function publishChatMessageCreated(params: {
  threadId: string;
  message: ChatMessageAblyPayload;
}): Promise<void> {
  try {
    const rest = getAblyRest();
    await rest.channels
      .get(chatThreadChannelName(params.threadId))
      .publish(CHAT_MESSAGE_CREATED_EVENT, params.message);
  } catch (error) {
    console.error("Failed to publish chat message to Ably:", error);
  }
}
