-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AlertStatus" ADD VALUE 'CANCELLED';
ALTER TYPE "AlertStatus" ADD VALUE 'COMPLETED';
ALTER TYPE "AlertStatus" ADD VALUE 'RESOLVED';
ALTER TYPE "AlertStatus" ADD VALUE 'REOPENED';
ALTER TYPE "AlertStatus" ADD VALUE 'REJECTED';

-- AlterTable
ALTER TABLE "EventRoom" ALTER COLUMN "callToken" DROP DEFAULT;
