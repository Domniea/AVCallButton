-- Alert priority + typed status; EventRoom current-state projection; backfill active rooms.

CREATE TYPE "AlertPriority" AS ENUM ('HIGH', 'MEDIUM');

-- Alert.status was still TEXT; AlertStatus enum already exists from earlier migrations.
ALTER TABLE "Alert" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Alert" ALTER COLUMN "status" TYPE "AlertStatus" USING (
  CASE UPPER(TRIM("status"))
    WHEN 'OPEN' THEN 'OPEN'::"AlertStatus"
    WHEN 'ACKNOWLEDGED' THEN 'ACKNOWLEDGED'::"AlertStatus"
    WHEN 'RESOLVED' THEN 'RESOLVED'::"AlertStatus"
    WHEN 'CLOSED' THEN 'CLOSED'::"AlertStatus"
    WHEN 'CANCELLED' THEN 'CANCELLED'::"AlertStatus"
    WHEN 'COMPLETED' THEN 'COMPLETED'::"AlertStatus"
    WHEN 'REOPENED' THEN 'REOPENED'::"AlertStatus"
    WHEN 'REJECTED' THEN 'REJECTED'::"AlertStatus"
    ELSE 'OPEN'::"AlertStatus"
  END
);
ALTER TABLE "Alert" ALTER COLUMN "status" SET DEFAULT 'OPEN'::"AlertStatus";

ALTER TABLE "Alert" ADD COLUMN "priority" "AlertPriority" NOT NULL DEFAULT 'HIGH';
ALTER TABLE "Alert" ADD COLUMN "acknowledgedAt" TIMESTAMP(3);
ALTER TABLE "Alert" ADD COLUMN "acknowledgedBy" TEXT;
ALTER TABLE "Alert" ADD COLUMN "resolvedAt" TIMESTAMP(3);
ALTER TABLE "Alert" ADD COLUMN "resolvedBy" TEXT;
ALTER TABLE "Alert" ADD COLUMN "requestTypeId" TEXT;
ALTER TABLE "Alert" ADD COLUMN "requesterType" TEXT;
ALTER TABLE "Alert" ADD COLUMN "responsibleGroupId" TEXT;

ALTER TABLE "EventRoom" ADD COLUMN "currentPriority" "AlertPriority";
ALTER TABLE "EventRoom" ADD COLUMN "currentAlertId" TEXT;
ALTER TABLE "EventRoom" ADD COLUMN "statusUpdatedAt" TIMESTAMP(3);
ALTER TABLE "EventRoom" ADD COLUMN "activeAlertCount" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "EventRoom_currentAlertId_key" ON "EventRoom"("currentAlertId");
CREATE INDEX "EventRoom_eventId_currentPriority_idx" ON "EventRoom"("eventId", "currentPriority");

CREATE INDEX "Alert_roomId_status_priority_createdAt_idx"
  ON "Alert"("roomId", "status", "priority", "createdAt");

ALTER TABLE "EventRoom"
  ADD CONSTRAINT "EventRoom_currentAlertId_fkey"
  FOREIGN KEY ("currentAlertId") REFERENCES "Alert"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

-- Existing OPEN (and ACKNOWLEDGED) alerts must not leave rooms falsely GREEN.
-- Driving alert = oldest active at highest priority (HIGH before MEDIUM).
WITH active AS (
  SELECT
    a.id,
    a."roomId",
    a.priority,
    a."createdAt",
    ROW_NUMBER() OVER (
      PARTITION BY a."roomId"
      ORDER BY
        CASE a.priority
          WHEN 'HIGH'::"AlertPriority" THEN 0
          WHEN 'MEDIUM'::"AlertPriority" THEN 1
        END ASC,
        a."createdAt" ASC
    ) AS rn
  FROM "Alert" a
  WHERE a.status IN ('OPEN'::"AlertStatus", 'ACKNOWLEDGED'::"AlertStatus")
),
counts AS (
  SELECT "roomId", COUNT(*)::integer AS cnt
  FROM active
  GROUP BY "roomId"
),
driving AS (
  SELECT id, "roomId", priority
  FROM active
  WHERE rn = 1
)
UPDATE "EventRoom" er
SET
  "currentPriority" = d.priority,
  "currentAlertId" = d.id,
  "activeAlertCount" = c.cnt,
  "statusUpdatedAt" = CURRENT_TIMESTAMP
FROM driving d
JOIN counts c ON c."roomId" = d."roomId"
WHERE er.id = d."roomId";
