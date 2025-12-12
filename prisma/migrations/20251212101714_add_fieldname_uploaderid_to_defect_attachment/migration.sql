/*
  Warnings:

  - Added the required column `uploadedById` to the `DefectAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "TestCase" DROP CONSTRAINT "TestCase_moduleId_projectId_fkey";

-- DropForeignKey
ALTER TABLE "TestCase" DROP CONSTRAINT "TestCase_suiteId_fkey";

-- AlterTable
-- First add uploadedById as nullable
ALTER TABLE "DefectAttachment" ADD COLUMN "fieldName" TEXT;
ALTER TABLE "DefectAttachment" ADD COLUMN "uploadedById" TEXT;

-- Set uploadedById to the defect creator for existing records
UPDATE "DefectAttachment" da
SET "uploadedById" = d."createdById"
FROM "Defect" d
WHERE da."defectId" = d."id" AND da."uploadedById" IS NULL;

-- Now make uploadedById NOT NULL
ALTER TABLE "DefectAttachment" ALTER COLUMN "uploadedById" SET NOT NULL;

-- CreateIndex
CREATE INDEX "DefectAttachment_uploadedById_idx" ON "DefectAttachment"("uploadedById");

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_moduleId_projectId_fkey" FOREIGN KEY ("moduleId", "projectId") REFERENCES "Module"("id", "projectId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_suiteId_fkey" FOREIGN KEY ("suiteId") REFERENCES "TestSuite"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectAttachment" ADD CONSTRAINT "DefectAttachment_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
