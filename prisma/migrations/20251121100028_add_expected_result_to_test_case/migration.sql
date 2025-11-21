/*
  Warnings:

  - The primary key for the `_RequirementToTestCase` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_RequirementToTestCase` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "expectedResult" TEXT;

-- AlterTable
ALTER TABLE "_RequirementToTestCase" DROP CONSTRAINT "_RequirementToTestCase_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_RequirementToTestCase_AB_unique" ON "_RequirementToTestCase"("A", "B");
