-- Invite.status as Postgres enum (replaces loose TEXT).

CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELED');

ALTER TABLE "Invite" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Invite" ALTER COLUMN "status" TYPE "InviteStatus" USING (
  CASE LOWER(TRIM("status"))
    WHEN 'pending' THEN 'PENDING'::"InviteStatus"
    WHEN 'accepted' THEN 'ACCEPTED'::"InviteStatus"
    ELSE 'PENDING'::"InviteStatus"
  END
);

ALTER TABLE "Invite" ALTER COLUMN "status" SET DEFAULT 'PENDING'::"InviteStatus";
