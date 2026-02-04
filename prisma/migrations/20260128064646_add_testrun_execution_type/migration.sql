-- AlterTable
ALTER TABLE "TestRun" ADD COLUMN     "executionType" TEXT NOT NULL DEFAULT 'MANUAL';

-- CreateIndex
CREATE INDEX "TestRun_executionType_idx" ON "TestRun"("executionType");
