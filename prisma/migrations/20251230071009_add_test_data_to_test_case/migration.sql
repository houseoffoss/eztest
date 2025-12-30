-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "testData" TEXT;

-- CreateIndex
CREATE INDEX "Requirement_status_idx" ON "Requirement"("status");
