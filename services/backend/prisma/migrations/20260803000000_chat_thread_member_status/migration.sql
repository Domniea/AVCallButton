-- ChatThreadMember.status (reuse MembershipStatus)
ALTER TABLE "ChatThreadMember" ADD COLUMN IF NOT EXISTS "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX IF NOT EXISTS "ChatThreadMember_threadId_status_idx" ON "ChatThreadMember"("threadId", "status");

-- Event-scoped DMs: unique pair per event (replaces workspace-scoped dmKey)
DROP INDEX IF EXISTS "ChatThread_workspaceId_dmKey_key";

CREATE UNIQUE INDEX "ChatThread_eventId_dmKey_key" ON "ChatThread"("eventId", "dmKey");

CREATE INDEX IF NOT EXISTS "ChatThread_eventId_updatedAt_idx" ON "ChatThread"("eventId", "updatedAt");
