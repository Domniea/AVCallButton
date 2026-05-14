/*
  Warnings:

  - You are about to drop the column `role` on the `Invite` table. All the data in the column will be lost.
  - Added the required column `workspaceRoleId` to the `Invite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invite" DROP COLUMN "role",
ADD COLUMN     "workspaceRoleId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Invite" ADD CONSTRAINT "Invite_workspaceRoleId_fkey" FOREIGN KEY ("workspaceRoleId") REFERENCES "WorkspaceRole"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
