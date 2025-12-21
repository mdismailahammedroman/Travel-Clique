/*
  Warnings:

  - The values [MODERATOR,SUPER_ADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `invoiceUrl` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `currentLocation` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `verifiedBadge` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `isBlocked` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `otpExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `verificationOtp` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Group` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TravelInterest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VisitedCountry` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN');
ALTER TABLE "public"."User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_groupId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMember" DROP CONSTRAINT "GroupMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "TravelInterest" DROP CONSTRAINT "TravelInterest_profileId_fkey";

-- DropForeignKey
ALTER TABLE "VisitedCountry" DROP CONSTRAINT "VisitedCountry_profileId_fkey";

-- DropIndex
DROP INDEX "Subscription_paymentId_key";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "invoiceUrl",
DROP COLUMN "stripeSubscriptionId";

-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "currentLocation",
DROP COLUMN "fullName",
ADD COLUMN     "interests" TEXT[],
ADD COLUMN     "location" TEXT,
ADD COLUMN     "visitedCountries" TEXT[];

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "verifiedBadge";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isBlocked",
DROP COLUMN "isVerified",
DROP COLUMN "otpExpiresAt",
DROP COLUMN "verificationOtp";

-- DropTable
DROP TABLE "Group";

-- DropTable
DROP TABLE "GroupMember";

-- DropTable
DROP TABLE "TravelInterest";

-- DropTable
DROP TABLE "VisitedCountry";

-- DropEnum
DROP TYPE "GroupRole";

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
