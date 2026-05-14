-- CreateTable
CREATE TABLE "EventAssignment" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workspaceRoleId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventAssignment_eventId_userId_key" ON "EventAssignment"("eventId", "userId");

-- CreateIndex
CREATE INDEX "EventAssignment_workspaceId_idx" ON "EventAssignment"("workspaceId");

-- CreateIndex
CREATE INDEX "EventAssignment_userId_idx" ON "EventAssignment"("userId");

-- CreateIndex
CREATE INDEX "EventAssignment_eventId_idx" ON "EventAssignment"("eventId");

-- AddForeignKey
ALTER TABLE "EventAssignment" ADD CONSTRAINT "EventAssignment_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAssignment" ADD CONSTRAINT "EventAssignment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventAssignment" ADD CONSTRAINT "EventAssignment_workspaceRoleId_fkey" FOREIGN KEY ("workspaceRoleId") REFERENCES "WorkspaceRole"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
