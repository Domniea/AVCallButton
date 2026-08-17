import { MembershipStatus } from "../prismaClient";
import { prisma } from "../prisma";
import { notifyUsers } from "../push/notifyUsers";

function previewBody(body: string): string {
  const trimmed = body.trim();
  if (trimmed.length <= 120) return trimmed;
  return `${trimmed.slice(0, 117)}…`;
}

function threadPushTitle(params: {
  type: string;
  eventName: string | null;
  zoneName: string | null;
}): string {
  switch (params.type) {
    case "EVENT_GROUP":
      return params.eventName ? `${params.eventName} chat` : "Event chat";
    case "ZONE":
      return params.zoneName ? `${params.zoneName} chat` : "Zone chat";
    case "DM":
      return "Direct message";
    default:
      return "Chat";
  }
}

/**
 * Offline / background interrupt for a new chat message.
 * Never throws — Postgres + Ably already succeeded.
 */
export async function notifyChatMessageCreated(params: {
  threadId: string;
  senderId: string;
  body: string;
}): Promise<void> {
  try {
    const now = new Date();
    const thread = await prisma.chatThread.findUnique({
      where: { id: params.threadId },
      select: {
        id: true,
        type: true,
        workspaceId: true,
        eventId: true,
        event: { select: { name: true } },
        zone: { select: { name: true } },
        members: {
          where: {
            status: MembershipStatus.ACTIVE,
            userId: { not: params.senderId },
            OR: [{ mutedUntil: null }, { mutedUntil: { lte: now } }],
          },
          select: { userId: true },
        },
      },
    });

    if (!thread || thread.members.length === 0) return;

    const title = threadPushTitle({
      type: thread.type,
      eventName: thread.event?.name ?? null,
      zoneName: thread.zone?.name ?? null,
    });

    const eventId = thread.eventId ?? "";
    const chatPath =
      eventId.length > 0
        ? `/workspace/${thread.workspaceId}/event/${eventId}/chat/${thread.id}`
        : `/dashboard`;

    await notifyUsers({
      userIds: thread.members.map((m) => m.userId),
      notification: {
        title,
        body: previewBody(params.body),
        data: {
          type: "chat",
          threadId: thread.id,
          workspaceId: thread.workspaceId,
          ...(eventId ? { eventId } : {}),
          url: chatPath,
        },
      },
    });
  } catch (error) {
    console.error("Failed to send chat push notifications:", error);
  }
}
