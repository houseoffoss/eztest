-- AlterTable (use IF NOT EXISTS to avoid conflicts)
ALTER TABLE "TestRun" ADD COLUMN IF NOT EXISTS "executionType" TEXT NOT NULL DEFAULT 'MANUAL';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TestRun_executionType_idx" ON "TestRun"("executionType");
