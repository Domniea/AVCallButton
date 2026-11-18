import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { addUserToEventGroupThread } from "../../src/functions/lib/chat/threads";
import { authorize } from "../../src/functions/lib/authorization";
import { prisma } from "../../src/functions/lib/prisma";
import {
  ChatThreadType,
  EventStatus,
  MembershipStatus,
} from "../../src/functions/lib/prismaClient";
import { roleRank } from "../../src/functions/lib/permissions";
import {
  createTestMembership,
  createTestWorkspace,
  destroyTestWorkspace,
  hasDatabase,
  type TestWorkspaceContext,
} from "../helpers/fixtures";

/**
 * Mirrors `events/create.ts` transactional create: event + creator assignment +
 * event-group chat membership. Handler AuthZ is covered via `authorize`.
 */
async function createDraftEventLikeHandler(params: {
  workspaceId: string;
  userId: string;
  membershipId: string;
  workspaceRoleId: string;
  eventRank: number;
  name: string;
  location?: string | null;
}) {
  return prisma.$transaction(async (tx) => {
    const newEvent = await tx.event.create({
      data: {
        name: params.name.trim(),
        status: EventStatus.DRAFT,
        location: params.location ?? null,
        venue: null,
        startTime: null,
        endTime: null,
        workspaceId: params.workspaceId,
      },
    });

    await tx.eventAssignment.create({
      data: {
        eventId: newEvent.id,
        membershipId: params.membershipId,
        workspaceRoleId: params.workspaceRoleId,
        eventRank: params.eventRank,
        assignedBy: params.userId,
      },
    });

    await addUserToEventGroupThread(tx, {
      workspaceId: params.workspaceId,
      eventId: newEvent.id,
      userId: params.userId,
    });

    return newEvent;
  });
}

describe.skipIf(!hasDatabase)("create event (integration)", () => {
  let ctx: TestWorkspaceContext;

  beforeAll(async () => {
    ctx = await createTestWorkspace();
  });

  afterAll(async () => {
    await destroyTestWorkspace(ctx?.workspaceId);
  });

  it("rejects event:create for crew; allows lead+", async () => {
    const crew = await createTestMembership(ctx, { rank: roleRank.crew });
    await expect(
      authorize(crew.userId, ctx.workspaceId, "event:create"),
    ).rejects.toThrow("FORBIDDEN");

    const lead = await createTestMembership(ctx, { rank: roleRank.lead });
    const membership = await authorize(
      lead.userId,
      ctx.workspaceId,
      "event:create",
    );
    expect(membership.id).toBe(lead.membership.id);
  });

  it("creates DRAFT event, roster assignment, and event-group thread member", async () => {
    const created = await createDraftEventLikeHandler({
      workspaceId: ctx.workspaceId,
      userId: ctx.ownerUserId,
      membershipId: ctx.ownerMembershipId,
      workspaceRoleId: ctx.ownerRoleId,
      eventRank: roleRank.owner,
      name: "  Opening Night  ",
      location: "Main Hall",
    });

    expect(created.status).toBe(EventStatus.DRAFT);
    expect(created.name).toBe("Opening Night");
    expect(created.location).toBe("Main Hall");

    const assignment = await prisma.eventAssignment.findUnique({
      where: {
        eventId_membershipId: {
          eventId: created.id,
          membershipId: ctx.ownerMembershipId,
        },
      },
    });
    expect(assignment?.eventRank).toBe(roleRank.owner);

    const thread = await prisma.chatThread.findFirst({
      where: { eventId: created.id, type: ChatThreadType.EVENT_GROUP },
      include: {
        members: { where: { userId: ctx.ownerUserId } },
      },
    });
    expect(thread).toBeTruthy();
    expect(thread?.members).toHaveLength(1);
    expect(thread?.members[0]?.status).toBe(MembershipStatus.ACTIVE);
  });

  it("create handler source wires AuthZ, transaction, and event-group chat", () => {
    const source = readFileSync(
      join(
        dirname(fileURLToPath(import.meta.url)),
        "../../src/functions/events/create.ts",
      ),
      "utf8",
    );

    expect(source).toMatch(/authorize\([\s\S]*"event:create"/);
    expect(source).toMatch(/EventStatus\.DRAFT/);
    expect(source).toMatch(/addUserToEventGroupThread/);
    expect(source).toMatch(/eventAssignment\.create/);
  });
});
