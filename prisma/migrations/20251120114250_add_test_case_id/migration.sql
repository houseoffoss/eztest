/*
  Warnings:

  - You are about to drop the column `testPlanId` on the `TestRun` table. All the data in the column will be lost.
  - You are about to drop the `TestPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestPlanCase` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[projectId,tcId]` on the table `TestCase` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tcId` to the `TestCase` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."TestPlan" DROP CONSTRAINT "TestPlan_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."TestPlan" DROP CONSTRAINT "TestPlan_projectId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TestPlanCase" DROP CONSTRAINT "TestPlanCase_testCaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TestPlanCase" DROP CONSTRAINT "TestPlanCase_testPlanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TestRun" DROP CONSTRAINT "TestRun_testPlanId_fkey";

-- DropIndex
DROP INDEX "public"."TestRun_testPlanId_idx";

-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN "tcId" TEXT;

-- AlterTable
ALTER TABLE "TestRun" DROP COLUMN "testPlanId";

-- DropTable
DROP TABLE "public"."TestPlan";

-- DropTable
DROP TABLE "public"."TestPlanCase";

-- Update existing test cases with generated tcId using a CTE
WITH numbered_cases AS (
  SELECT id, 'tc' || ROW_NUMBER() OVER (PARTITION BY "projectId" ORDER BY "createdAt") as new_tcId
  FROM "TestCase"
  WHERE "tcId" IS NULL
)
UPDATE "TestCase" 
SET "tcId" = numbered_cases.new_tcId
FROM numbered_cases
WHERE "TestCase".id = numbered_cases.id;

-- Make tcId NOT NULL after setting values for existing rows
ALTER TABLE "TestCase" ALTER COLUMN "tcId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "TestCase_projectId_tcId_key" ON "TestCase"("projectId", "tcId");


