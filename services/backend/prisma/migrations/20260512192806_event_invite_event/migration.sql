/*
  Warnings:

  - A unique constraint covering the columns `[eventId,inviteId]` on the table `EventInvite` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[eventId,membershipId]` on the table `EventInvite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EventInvite_eventId_inviteId_key" ON "EventInvite"("eventId", "inviteId");

-- CreateIndex
CREATE UNIQUE INDEX "EventInvite_eventId_membershipId_key" ON "EventInvite"("eventId", "membershipId");
