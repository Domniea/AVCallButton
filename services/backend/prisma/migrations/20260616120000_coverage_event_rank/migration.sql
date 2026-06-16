-- Add event rank snapshot to room/zone coverage for sorting and in-context permissions.

ALTER TABLE "EventRoomCoverage" ADD COLUMN "eventRank" INTEGER;

UPDATE "EventRoomCoverage" AS rc
SET "eventRank" = ea."eventRank"
FROM "EventRoom" AS r
INNER JOIN "EventAssignment" AS ea
  ON ea."eventId" = r."eventId"
WHERE rc."roomId" = r."id"
  AND ea."membershipId" = rc."membershipId";

ALTER TABLE "EventRoomCoverage" ALTER COLUMN "eventRank" SET NOT NULL;

CREATE INDEX "EventRoomCoverage_roomId_eventRank_idx" ON "EventRoomCoverage"("roomId", "eventRank");

ALTER TABLE "EventZoneCoverage" ADD COLUMN "eventRank" INTEGER;

UPDATE "EventZoneCoverage" AS zc
SET "eventRank" = ea."eventRank"
FROM "EventZone" AS z
INNER JOIN "EventAssignment" AS ea
  ON ea."eventId" = z."eventId"
WHERE zc."zoneId" = z."id"
  AND ea."membershipId" = zc."membershipId";

ALTER TABLE "EventZoneCoverage" ALTER COLUMN "eventRank" SET NOT NULL;

CREATE INDEX "EventZoneCoverage_zoneId_eventRank_idx" ON "EventZoneCoverage"("zoneId", "eventRank");
