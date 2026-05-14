-- Store assignment tiers as rank integers (see WorkspaceRole.rank); drop role UUID FKs.

ALTER TABLE "EventAssignment" ADD COLUMN "workspaceRank" INTEGER;
ALTER TABLE "EventAssignment" ADD COLUMN "eventRank" INTEGER;

UPDATE "EventAssignment" ea
SET "workspaceRank" = wm."rank"
FROM "WorkspaceRole" wm
WHERE wm."uuid" = ea."membershipWorkspaceRoleId";

UPDATE "EventAssignment" ea
SET "eventRank" = we."rank"
FROM "WorkspaceRole" we
WHERE we."uuid" = ea."eventWorkspaceRoleId";

ALTER TABLE "EventAssignment" ALTER COLUMN "workspaceRank" SET NOT NULL;
ALTER TABLE "EventAssignment" ALTER COLUMN "eventRank" SET NOT NULL;

ALTER TABLE "EventAssignment" DROP CONSTRAINT "EventAssignment_membershipWorkspaceRoleId_fkey";
ALTER TABLE "EventAssignment" DROP CONSTRAINT "EventAssignment_eventWorkspaceRoleId_fkey";

ALTER TABLE "EventAssignment" DROP COLUMN "membershipWorkspaceRoleId";
ALTER TABLE "EventAssignment" DROP COLUMN "eventWorkspaceRoleId";
