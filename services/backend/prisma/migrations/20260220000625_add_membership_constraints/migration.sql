/*
  Warnings:

  - A unique constraint covering the columns `[userId,workspaceId]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Membership_userId_workspaceId_key" ON "Membership"("userId", "workspaceId");
