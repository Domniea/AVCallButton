-- Restore partial unique indexes for EventInvite XOR paths.
-- A later migration incorrectly only dropped these indexes; recreate idempotently.

CREATE UNIQUE INDEX IF NOT EXISTS "EventInvite_eventId_membershipId_unique"
ON "EventInvite"("eventId", "membershipId")
WHERE "membershipId" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "EventInvite_eventId_inviteId_unique"
ON "EventInvite"("eventId", "inviteId")
WHERE "inviteId" IS NOT NULL;
