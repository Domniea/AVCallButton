-- Rename room assignment table to coverage terminology
ALTER TABLE "EventRoomAssignment" RENAME TO "EventRoomCoverage";
ALTER INDEX "EventRoomAssignment_pkey" RENAME TO "EventRoomCoverage_pkey";
ALTER INDEX "EventRoomAssignment_roomId_membershipId_key" RENAME TO "EventRoomCoverage_roomId_membershipId_key";
ALTER INDEX "EventRoomAssignment_roomId_idx" RENAME TO "EventRoomCoverage_roomId_idx";
ALTER INDEX "EventRoomAssignment_membershipId_idx" RENAME TO "EventRoomCoverage_membershipId_idx";
ALTER TABLE "EventRoomCoverage" RENAME CONSTRAINT "EventRoomAssignment_roomId_fkey" TO "EventRoomCoverage_roomId_fkey";
ALTER TABLE "EventRoomCoverage" RENAME CONSTRAINT "EventRoomAssignment_membershipId_fkey" TO "EventRoomCoverage_membershipId_fkey";

-- Add zone coverage table
CREATE TABLE "EventZoneCoverage" (
    "id" TEXT NOT NULL,
    "zoneId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventZoneCoverage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EventZoneCoverage_zoneId_membershipId_key" ON "EventZoneCoverage"("zoneId", "membershipId");
CREATE INDEX "EventZoneCoverage_zoneId_idx" ON "EventZoneCoverage"("zoneId");
CREATE INDEX "EventZoneCoverage_membershipId_idx" ON "EventZoneCoverage"("membershipId");

ALTER TABLE "EventZoneCoverage"
ADD CONSTRAINT "EventZoneCoverage_zoneId_fkey"
FOREIGN KEY ("zoneId") REFERENCES "EventZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "EventZoneCoverage"
ADD CONSTRAINT "EventZoneCoverage_membershipId_fkey"
FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
