/*
  Warnings:

  - You are about to drop the column `travelPlanId` on the `TravelGroup` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "TravelGroup" DROP CONSTRAINT "TravelGroup_travelPlanId_fkey";

-- DropIndex
DROP INDEX "TravelGroup_travelPlanId_key";

-- AlterTable
ALTER TABLE "TravelGroup" DROP COLUMN "travelPlanId";

-- AddForeignKey
ALTER TABLE "TravelPlan" ADD CONSTRAINT "TravelPlan_travelGroupId_fkey" FOREIGN KEY ("travelGroupId") REFERENCES "TravelGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
