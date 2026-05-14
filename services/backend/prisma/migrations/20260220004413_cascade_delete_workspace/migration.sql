-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Show" DROP CONSTRAINT "Show_workspaceId_fkey";

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Show" ADD CONSTRAINT "Show_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
