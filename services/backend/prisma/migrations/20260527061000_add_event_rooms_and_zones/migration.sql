-- CreateTable
CREATE TABLE "EventZone" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRoom" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "zoneId" TEXT,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventRoom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRoomAssignment" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRoomAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventZone_eventId_idx" ON "EventZone"("eventId");

-- CreateIndex
CREATE INDEX "EventZone_eventId_sortOrder_idx" ON "EventZone"("eventId", "sortOrder");

-- CreateIndex
CREATE INDEX "EventRoom_eventId_idx" ON "EventRoom"("eventId");

-- CreateIndex
CREATE INDEX "EventRoom_zoneId_idx" ON "EventRoom"("zoneId");

-- CreateIndex
CREATE INDEX "EventRoom_eventId_sortOrder_idx" ON "EventRoom"("eventId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "EventRoomAssignment_roomId_membershipId_key" ON "EventRoomAssignment"("roomId", "membershipId");

-- CreateIndex
CREATE INDEX "EventRoomAssignment_roomId_idx" ON "EventRoomAssignment"("roomId");

-- CreateIndex
CREATE INDEX "EventRoomAssignment_membershipId_idx" ON "EventRoomAssignment"("membershipId");

-- AddForeignKey
ALTER TABLE "EventZone" ADD CONSTRAINT "EventZone_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRoom" ADD CONSTRAINT "EventRoom_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRoom" ADD CONSTRAINT "EventRoom_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "EventZone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRoomAssignment" ADD CONSTRAINT "EventRoomAssignment_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "EventRoom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRoomAssignment" ADD CONSTRAINT "EventRoomAssignment_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
