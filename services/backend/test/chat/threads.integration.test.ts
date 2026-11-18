import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  addUserToEventGroupThread,
  getOrCreateDmThread,
  getOrCreateEventGroupThread,
  getOrCreateZoneThread,
} from "../../src/functions/lib/chat/threads";
import {
  createThreadMessage,
  listThreadMessages,
} from "../../src/functions/lib/chat/messages";
import { markThreadRead } from "../../src/functions/lib/chat/read";
import { prisma } from "../../src/functions/lib/prisma";
import {
  ChatThreadType,
  MembershipStatus,
} from "../../src/functions/lib/prismaClient";
import { roleRank } from "../../src/functions/lib/permissions";
import {
  createTestEvent,
  createTestMembership,
  createTestWorkspace,
  createTestZone,
  destroyTestWorkspace,
  hasDatabase,
  type TestWorkspaceContext,
} from "../helpers/fixtures";

describe.skipIf(!hasDatabase)("chat threads (integration)", () => {
  let ctx: TestWorkspaceContext;
  let eventId = "";
  let crewUserId = "";

  beforeAll(async () => {
    ctx = await createTestWorkspace();
    const event = await createTestEvent(ctx, { name: "Chat test event" });
    eventId = event.id;

    const crew = await createTestMembership(ctx, { rank: roleRank.crew });
    crewUserId = crew.userId;

    await prisma.eventAssignment.create({
      data: {
        eventId,
        membershipId: crew.membership.id,
        workspaceRoleId: crew.membership.workspaceRoleId,
        eventRank: roleRank.crew,
        assignedBy: ctx.ownerUserId,
      },
    });
  });

  afterAll(async () => {
    await destroyTestWorkspace(ctx?.workspaceId);
  });

  it("getOrCreateEventGroupThread is idempotent", async () => {
    const first = await getOrCreateEventGroupThread(prisma, {
      workspaceId: ctx.workspaceId,
      eventId,
    });
    const second = await getOrCreateEventGroupThread(prisma, {
      workspaceId: ctx.workspaceId,
      eventId,
    });

    expect(first.id).toBe(second.id);
    expect(first.type).toBe(ChatThreadType.EVENT_GROUP);
  });

  it("addUserToEventGroupThread creates membership", async () => {
    await addUserToEventGroupThread(prisma, {
      workspaceId: ctx.workspaceId,
      eventId,
      userId: ctx.ownerUserId,
    });

    const member = await prisma.chatThreadMember.findFirst({
      where: {
        userId: ctx.ownerUserId,
        thread: { eventId, type: ChatThreadType.EVENT_GROUP },
      },
    });
    expect(member).toBeTruthy();
  });

  it("getOrCreateDmThread requires both users on roster and is idempotent", async () => {
    const stranger = await createTestMembership(ctx, { rank: roleRank.crew });

    await expect(
      getOrCreateDmThread(prisma, {
        workspaceId: ctx.workspaceId,
        eventId,
        userIdA: ctx.ownerUserId,
        userIdB: stranger.userId,
      }),
    ).rejects.toThrow(/Both users must be on the event roster/);

    await expect(
      getOrCreateDmThread(prisma, {
        workspaceId: ctx.workspaceId,
        eventId,
        userIdA: ctx.ownerUserId,
        userIdB: ctx.ownerUserId,
      }),
    ).rejects.toThrow(/Cannot create a DM with yourself/);

    const a = await getOrCreateDmThread(prisma, {
      workspaceId: ctx.workspaceId,
      eventId,
      userIdA: ctx.ownerUserId,
      userIdB: crewUserId,
    });
    const b = await getOrCreateDmThread(prisma, {
      workspaceId: ctx.workspaceId,
      eventId,
      userIdA: crewUserId,
      userIdB: ctx.ownerUserId,
    });

    expect(a.id).toBe(b.id);
    expect(a.type).toBe(ChatThreadType.DM);

    const members = await prisma.chatThreadMember.findMany({
      where: { threadId: a.id },
    });
    expect(members.map((m) => m.userId).sort()).toEqual(
      [ctx.ownerUserId, crewUserId].sort(),
    );
  });

  it("zone thread upsert + message list / read cursor", async () => {
    const zone = await createTestZone(eventId, { name: "Ballroom" });
    const thread = await getOrCreateZoneThread(prisma, {
      workspaceId: ctx.workspaceId,
      eventId,
      zoneId: zone.id,
    });
    expect(thread.type).toBe(ChatThreadType.ZONE);

    await prisma.chatThreadMember.create({
      data: {
        threadId: thread.id,
        userId: ctx.ownerUserId,
        status: MembershipStatus.ACTIVE,
      },
    });

    const m1 = await createThreadMessage(prisma, {
      threadId: thread.id,
      senderId: ctx.ownerUserId,
      body: "first",
    });
    const m2 = await createThreadMessage(prisma, {
      threadId: thread.id,
      senderId: ctx.ownerUserId,
      body: "second",
    });

    const page = await listThreadMessages(prisma, {
      threadId: thread.id,
      limit: 50,
    });
    expect(page.messages.map((m) => m.body)).toEqual(["first", "second"]);
    expect(page.hasMore).toBe(false);

    const after = await listThreadMessages(prisma, {
      threadId: thread.id,
      limit: 50,
      after: m1.id,
    });
    expect(after.messages.map((m) => m.id)).toEqual([m2.id]);

    const member = await markThreadRead(prisma, {
      threadId: thread.id,
      userId: ctx.ownerUserId,
      messageId: m2.id,
    });
    expect(member.lastReadMessageId).toBe(m2.id);

    const unchanged = await markThreadRead(prisma, {
      threadId: thread.id,
      userId: ctx.ownerUserId,
      messageId: m1.id,
    });
    expect(unchanged.lastReadMessageId).toBe(m2.id);
  });
});
