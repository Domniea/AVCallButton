/*
  Warnings:

  - Changed the type of `platform` on the `DeviceToken` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('IOS', 'ANDROID', 'WEB');

-- AlterTable
ALTER TABLE "DeviceToken" DROP COLUMN "platform",
ADD COLUMN     "platform" "DevicePlatform" NOT NULL;
