-- EventAssignment: membershipId + workspaceRoleId + eventRank + assignedBy; remove denormalized workspace/user/workspaceRank/status.

ALTER TABLE "EventAssignment" ADD COLUMN "membershipId" TEXT;
ALTER TABLE "EventAssignment" ADD COLUMN "workspaceRoleId" TEXT;

UPDATE "EventAssignment" ea
SET "membershipId" = m."id"
FROM "Membership" m
WHERE m."userId" = ea."userId" AND m."workspaceId" = ea."workspaceId";

UPDATE "EventAssignment" ea
SET "workspaceRoleId" = m."workspaceRoleId"
FROM "Membership" m
WHERE m."id" = ea."membershipId";

ALTER TABLE "EventAssignment" ALTER COLUMN "membershipId" SET NOT NULL;
ALTER TABLE "EventAssignment" ALTER COLUMN "workspaceRoleId" SET NOT NULL;

-- Prisma created this as a UNIQUE INDEX (see 20260418140000), not a table constraint.
DROP INDEX IF EXISTS "EventAssignment_eventId_userId_key";

ALTER TABLE "EventAssignment" DROP CONSTRAINT "EventAssignment_workspaceId_fkey";

ALTER TABLE "EventAssignment" DROP COLUMN "workspaceId";
ALTER TABLE "EventAssignment" DROP COLUMN "userId";
ALTER TABLE "EventAssignment" DROP COLUMN "workspaceRank";
ALTER TABLE "EventAssignment" DROP COLUMN "status";

ALTER TABLE "EventAssignment" RENAME COLUMN "invitedBy" TO "assignedBy";

CREATE UNIQUE INDEX "EventAssignment_eventId_membershipId_key" ON "EventAssignment"("eventId", "membershipId");

ALTER TABLE "EventAssignment" ADD CONSTRAINT "EventAssignment_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventAssignment" ADD CONSTRAINT "EventAssignment_workspaceRoleId_fkey" FOREIGN KEY ("workspaceRoleId") REFERENCES "WorkspaceRole"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP INDEX IF EXISTS "EventAssignment_workspaceId_idx";
DROP INDEX IF EXISTS "EventAssignment_userId_idx";

CREATE INDEX "EventAssignment_membershipId_idx" ON "EventAssignment"("membershipId");
