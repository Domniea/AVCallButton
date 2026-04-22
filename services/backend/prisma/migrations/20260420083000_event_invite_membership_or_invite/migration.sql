-- Allow EventInvite rows to reference either an existing membership or a workspace invite (exactly one).

ALTER TABLE "EventInvite"
ADD COLUMN "inviteId" TEXT;

ALTER TABLE "EventInvite"
ALTER COLUMN "membershipId" DROP NOT NULL;

ALTER TABLE "EventInvite"
ADD CONSTRAINT "EventInvite_inviteId_fkey"
FOREIGN KEY ("inviteId") REFERENCES "Invite"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- Enforce XOR: exactly one of membershipId/inviteId must be present.
ALTER TABLE "EventInvite"
ADD CONSTRAINT "EventInvite_membership_or_invite_check"
CHECK (
  ("membershipId" IS NOT NULL AND "inviteId" IS NULL) OR
  ("membershipId" IS NULL AND "inviteId" IS NOT NULL)
);

-- Replace old uniqueness with path-specific uniqueness.
DROP INDEX IF EXISTS "EventInvite_eventId_membershipId_key";

CREATE UNIQUE INDEX "EventInvite_eventId_membershipId_unique"
ON "EventInvite"("eventId", "membershipId")
WHERE "membershipId" IS NOT NULL;

CREATE UNIQUE INDEX "EventInvite_eventId_inviteId_unique"
ON "EventInvite"("eventId", "inviteId")
WHERE "inviteId" IS NOT NULL;

CREATE INDEX "EventInvite_inviteId_idx" ON "EventInvite"("inviteId");
