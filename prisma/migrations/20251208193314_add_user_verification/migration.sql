/*
  Warnings:

  - You are about to drop the column `travelGroupId` on the `TravelPlan` table. All the data in the column will be lost.
  - You are about to drop the `GroupMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TravelGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "TravelGroup" DROP CONSTRAINT "TravelGroup_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "TravelPlan" DROP CONSTRAINT "TravelPlan_travelGroupId_fkey";

-- DropIndex
DROP INDEX "TravelPlan_travelGroupId_key";

-- AlterTable
ALTER TABLE "TravelPlan" DROP COLUMN "travelGroupId";

-- DropTable
DROP TABLE "GroupMember";

-- DropTable
DROP TABLE "TravelGroup";
