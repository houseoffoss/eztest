/*
  Warnings:

  - You are about to drop the column `displayId` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `addedAt` on the `TestRunSuite` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "displayId";

-- AlterTable
ALTER TABLE "TestRunSuite" DROP COLUMN "addedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
