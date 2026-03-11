-- AlterTable (use IF NOT EXISTS to avoid conflicts with columns added in init migration)
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "automation" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "environment" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "evidence" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "flowId" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "layer" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "rtcId" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "target" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "testType" TEXT;

-- CreateIndex
CREATE INDEX "TestCase_layer_idx" ON "TestCase"("layer");

-- CreateIndex
CREATE INDEX "TestCase_testType_idx" ON "TestCase"("testType");

-- CreateIndex
CREATE INDEX "TestCase_environment_idx" ON "TestCase"("environment");

-- CreateIndex
CREATE INDEX "TestCase_target_idx" ON "TestCase"("target");
