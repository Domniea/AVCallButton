import type { ChatThread, Prisma } from "@prisma/client";

import {
  ChatThreadType,
  MembershipStatus,
  Prisma as PrismaNS,
} from "../prismaClient";
import { roleRank } from "../permissions";
import { prisma } from "../prisma";

type DbClient = Prisma.TransactionClient | typeof prisma;

/** Leads and above (eventRank ≥ 6) are members of every zone thread on the event. */
export const LEAD_MIN_EVENT_RANK = roleRank.lead;

export function buildDmKey(userIdA: string, userIdB: string): string {
  return [userIdA, userIdB].sort().join(":");
}

export async function getOrCreateEventGroupThread(
  db: DbClient,
  params: { workspaceId: string; eventId: string },
): Promise<ChatThread> {
  const existing = await db.chatThread.findFirst({
    where: {
      eventId: params.eventId,
      type: ChatThreadType.EVENT_GROUP,
    },
  });
  if (existing) return existing;

  try {
    return await db.chatThread.create({
      data: {
        type: ChatThreadType.EVENT_GROUP,
        workspaceId: params.workspaceId,
        eventId: params.eventId,
      },
    });
  } catch (error) {
    if (
      error instanceof PrismaNS.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const again = await db.chatThread.findFirst({
        where: {
          eventId: params.eventId,
          type: ChatThreadType.EVENT_GROUP,
        },
      });
      if (again) return again;
    }
    throw error;
  }
}

export async function getOrCreateZoneThread(
  db: DbClient,
  params: { workspaceId: string; eventId: string; zoneId: string },
): Promise<ChatThread> {
  return db.chatThread.upsert({
    where: { zoneId: params.zoneId },
    create: {
      type: ChatThreadType.ZONE,
      workspaceId: params.workspaceId,
      eventId: params.eventId,
      zoneId: params.zoneId,
    },
    update: {},
  });
}


async function assertShareEventRoster(
  db: DbClient,
  params: {
    workspaceId: string;
    eventId: string;
    userIdA: string;
    userIdB: string;
  },
): Promise<void> {
  const event = await db.event.findFirst({
    where: { id: params.eventId, workspaceId: params.workspaceId },
    select: { id: true },
  });
  if (!event) {
    throw new Error("Event not found");
  }

  const assignments = await db.eventAssignment.findMany({
    where: {
      eventId: params.eventId,
      membership: {
        status: MembershipStatus.ACTIVE,
        userId: { in: [params.userIdA, params.userIdB] },
      },
    },
    select: { membership: { select: { userId: true } } },
  });

  const onRoster = new Set(
    assignments.map((row) => row.membership.userId),
  );
  if (!onRoster.has(params.userIdA) || !onRoster.has(params.userIdB)) {
    throw new Error("Both users must be on the event roster");
  }
}


/**
 * Get or create a 1:1 DM thread for an event (idempotent).
 * Both users must be on the event roster. Adds both as ACTIVE thread members.
 */
export async function getOrCreateDmThread(
  db: DbClient,
  params: {
    workspaceId: string;
    eventId: string;
    userIdA: string;
    userIdB: string;
  },
): Promise<ChatThread> {
  if (params.userIdA === params.userIdB) {
    throw new Error("Cannot create a DM with yourself");
  }

  await assertShareEventRoster(db, params);

  const dmKey = buildDmKey(params.userIdA, params.userIdB);

  const thread = await db.chatThread.upsert({
    where: {
      eventId_dmKey: {
        eventId: params.eventId,
        dmKey,
      },
    },
    create: {
      type: ChatThreadType.DM,
      workspaceId: params.workspaceId,
      eventId: params.eventId,
      dmKey,
    },
    update: {},
  });

  await addThreadMember(db, { threadId: thread.id, userId: params.userIdA });
  await addThreadMember(db, { threadId: thread.id, userId: params.userIdB });

  return thread;
}

export async function addThreadMember(
  db: DbClient,
  params: { threadId: string; userId: string },
) {
  return db.chatThreadMember.upsert({
    where: {
      threadId_userId: {
        threadId: params.threadId,
        userId: params.userId,
      },
    },
    create: {
      threadId: params.threadId,
      userId: params.userId,
      status: MembershipStatus.ACTIVE,
    },
    update: {
      status: MembershipStatus.ACTIVE,
    },
  });
}

export async function addUserToEventGroupThread(
  db: DbClient,
  params: { eventId: string; userId: string; workspaceId?: string },
) {
  let workspaceId = params.workspaceId;
  if (!workspaceId) {
    const event = await db.event.findUniqueOrThrow({
      where: { id: params.eventId },
      select: { workspaceId: true },
    });
    workspaceId = event.workspaceId;
  }

  const thread = await getOrCreateEventGroupThread(db, {
    workspaceId,
    eventId: params.eventId,
  });
  return addThreadMember(db, { threadId: thread.id, userId: params.userId });
}

/** Add user to a zone's ZONE thread, creating the thread if needed. */
export async function addUserToZoneThread(
  db: DbClient,
  params: { zoneId: string; userId: string },
) {
  const zone = await db.eventZone.findUniqueOrThrow({
    where: { id: params.zoneId },
    select: {
      id: true,
      eventId: true,
      event: { select: { workspaceId: true } },
    },
  });

  const thread = await getOrCreateZoneThread(db, {
    workspaceId: zone.event.workspaceId,
    eventId: zone.eventId,
    zoneId: zone.id,
  });
  return addThreadMember(db, { threadId: thread.id, userId: params.userId });
}

export async function addLeadsToZoneThread(
  db: DbClient,
  params: { eventId: string; zoneId: string },
) {
  const leads = await db.eventAssignment.findMany({
    where: {
      eventId: params.eventId,
      eventRank: { gte: LEAD_MIN_EVENT_RANK },
      membership: { status: MembershipStatus.ACTIVE },
    },
    select: { membership: { select: { userId: true } } },
  });

  for (const row of leads) {
    await addUserToZoneThread(db, {
      zoneId: params.zoneId,
      userId: row.membership.userId,
    });
  }
}

export async function addUserToAllZoneThreadsIfLead(
  db: DbClient,
  params: { eventId: string; userId: string; eventRank: number },
) {
  if (params.eventRank < LEAD_MIN_EVENT_RANK) return;

  const zones = await db.eventZone.findMany({
    where: { eventId: params.eventId },
    select: { id: true },
  });

  for (const zone of zones) {
    await addUserToZoneThread(db, {
      zoneId: zone.id,
      userId: params.userId,
    });
  }
}
