-- Drop redundant role string; permissions use WorkspaceRole via workspaceRoleId.
ALTER TABLE "Membership" DROP COLUMN "role";
