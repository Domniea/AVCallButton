-- EventAssignment: split org (membership) role vs event role; backfill both from legacy workspaceRoleId.

ALTER TABLE "EventAssignment" ADD COLUMN "membershipWorkspaceRoleId" TEXT;
ALTER TABLE "EventAssignment" ADD COLUMN "eventWorkspaceRoleId" TEXT;

UPDATE "EventAssignment"
SET
  "membershipWorkspaceRoleId" = "workspaceRoleId",
  "eventWorkspaceRoleId" = "workspaceRoleId";

ALTER TABLE "EventAssignment" ALTER COLUMN "membershipWorkspaceRoleId" SET NOT NULL;
ALTER TABLE "EventAssignment" ALTER COLUMN "eventWorkspaceRoleId" SET NOT NULL;

ALTER TABLE "EventAssignment" DROP CONSTRAINT "EventAssignment_workspaceRoleId_fkey";
ALTER TABLE "EventAssignment" DROP COLUMN "workspaceRoleId";

ALTER TABLE "EventAssignment" ADD CONSTRAINT "EventAssignment_membershipWorkspaceRoleId_fkey" FOREIGN KEY ("membershipWorkspaceRoleId") REFERENCES "WorkspaceRole"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EventAssignment" ADD CONSTRAINT "EventAssignment_eventWorkspaceRoleId_fkey" FOREIGN KEY ("eventWorkspaceRoleId") REFERENCES "WorkspaceRole"("uuid") ON DELETE RESTRICT ON UPDATE CASCADE;
