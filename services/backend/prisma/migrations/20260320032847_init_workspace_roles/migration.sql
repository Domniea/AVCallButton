/*
  Warnings:

  - Added the required column `workspaceRoleId` to the `Membership` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "workspaceRoleId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "WorkspaceRole" (
    "uuid" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceRole_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceRole_workspaceId_rank_key" ON "WorkspaceRole"("workspaceId", "rank");

-- CreateIndex
CREATE INDEX "Membership_workspaceRoleId_idx" ON "Membership"("workspaceRoleId");

-- AddForeignKey
ALTER TABLE "WorkspaceRole" ADD CONSTRAINT "WorkspaceRole_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_workspaceRoleId_fkey" FOREIGN KEY ("workspaceRoleId") REFERENCES "WorkspaceRole"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
