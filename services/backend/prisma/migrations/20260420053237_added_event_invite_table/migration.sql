-- CreateEnum
CREATE TYPE "EventInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "EventInvite" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "workspaceRoleId" TEXT NOT NULL,
    "eventRank" INTEGER NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "status" "EventInviteStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EventInvite_eventId_idx" ON "EventInvite"("eventId");

-- CreateIndex
CREATE INDEX "EventInvite_membershipId_idx" ON "EventInvite"("membershipId");

-- CreateIndex
CREATE UNIQUE INDEX "EventInvite_eventId_membershipId_key" ON "EventInvite"("eventId", "membershipId");

-- AddForeignKey
ALTER TABLE "EventInvite" ADD CONSTRAINT "EventInvite_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvite" ADD CONSTRAINT "EventInvite_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventInvite" ADD CONSTRAINT "EventInvite_workspaceRoleId_fkey" FOREIGN KEY ("workspaceRoleId") REFERENCES "WorkspaceRole"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
