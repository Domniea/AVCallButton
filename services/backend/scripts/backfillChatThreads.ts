/**
 * One-off: create missing EVENT_GROUP / ZONE chat threads and members
 * for events that existed before chat lifecycle hooks.
 *
 * Idempotent — safe to re-run.
 *
 *   yarn workspace @av/backend chat:backfill
 *   yarn workspace @av/backend chat:backfill -- --eventId=<uuid>
 */
import {
  addThreadMember,
  getOrCreateEventGroupThread,
  getOrCreateZoneThread,
  LEAD_MIN_EVENT_RANK,
} from "../src/functions/lib/chat/threads";
import { MembershipStatus } from "../src/functions/lib/prismaClient";
import { prisma } from "../src/functions/lib/prisma";

function parseEventIdArg(argv: string[]): string | undefined {
  for (const arg of argv) {
    if (arg.startsWith("--eventId=")) return arg.slice("--eventId=".length);
  }
  return undefined;
}

async function backfillEvent(event: {
  id: string;
  workspaceId: string;
  name: string;
}) {
  const groupThread = await getOrCreateEventGroupThread(prisma, {
    workspaceId: event.workspaceId,
    eventId: event.id,
  });

  const assignments = await prisma.eventAssignment.findMany({
    where: {
      eventId: event.id,
      membership: { status: MembershipStatus.ACTIVE },
    },
    select: { membership: { select: { userId: true } } },
  });

  let groupMembers = 0;
  for (const row of assignments) {
    await addThreadMember(prisma, {
      threadId: groupThread.id,
      userId: row.membership.userId,
    });
    groupMembers += 1;
  }

  const zones = await prisma.eventZone.findMany({
    where: { eventId: event.id },
    select: { id: true, name: true },
  });

  const leads = await prisma.eventAssignment.findMany({
    where: {
      eventId: event.id,
      eventRank: { gte: LEAD_MIN_EVENT_RANK },
      membership: { status: MembershipStatus.ACTIVE },
    },
    select: { membership: { select: { userId: true } } },
  });
  const leadUserIds = [
    ...new Set(leads.map((row) => row.membership.userId)),
  ];

  let zoneThreads = 0;
  let zoneMembers = 0;
  for (const zone of zones) {
    const zoneThread = await getOrCreateZoneThread(prisma, {
      workspaceId: event.workspaceId,
      eventId: event.id,
      zoneId: zone.id,
    });
    zoneThreads += 1;

    const coverage = await prisma.eventZoneCoverage.findMany({
      where: {
        zoneId: zone.id,
        membership: { status: MembershipStatus.ACTIVE },
      },
      select: { membership: { select: { userId: true } } },
    });

    const memberUserIds = new Set<string>(leadUserIds);
    for (const row of coverage) {
      memberUserIds.add(row.membership.userId);
    }

    for (const userId of memberUserIds) {
      await addThreadMember(prisma, {
        threadId: zoneThread.id,
        userId,
      });
      zoneMembers += 1;
    }
  }

  return {
    groupMembers,
    zoneThreads,
    zoneMembers,
    leads: leadUserIds.length,
  };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const eventId = parseEventIdArg(process.argv.slice(2));
  const events = await prisma.event.findMany({
    where: eventId ? { id: eventId } : undefined,
    select: { id: true, workspaceId: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  if (eventId && events.length === 0) {
    throw new Error(`No event found for id ${eventId}`);
  }

  console.log(
    `Backfilling chat threads for ${events.length} event(s)${
      eventId ? ` (${eventId})` : ""
    }…`,
  );

  for (const event of events) {
    const result = await backfillEvent(event);
    console.log(
      `✓ ${event.name} (${event.id}): event-group members=${result.groupMembers}, zones=${result.zoneThreads}, zone members=${result.zoneMembers}, leads=${result.leads}`,
    );
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
