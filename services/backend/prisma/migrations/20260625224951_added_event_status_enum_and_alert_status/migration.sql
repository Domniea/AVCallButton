-- Event.status and Alert.status as Postgres enums (replaces loose TEXT).

CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ENDED', 'CANCELLED');

CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'CLOSED');

ALTER TABLE "Event" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Event" ALTER COLUMN "status" TYPE "EventStatus" USING (
  CASE LOWER(TRIM("status"))
    WHEN 'draft' THEN 'DRAFT'::"EventStatus"
    WHEN 'active' THEN 'ACTIVE'::"EventStatus"
    WHEN 'ended' THEN 'ENDED'::"EventStatus"
    WHEN 'cancelled' THEN 'CANCELLED'::"EventStatus"
    WHEN 'canceled' THEN 'CANCELLED'::"EventStatus"
    ELSE 'DRAFT'::"EventStatus"
  END
);

ALTER TABLE "Event" ALTER COLUMN "status" SET DEFAULT 'DRAFT'::"EventStatus";
