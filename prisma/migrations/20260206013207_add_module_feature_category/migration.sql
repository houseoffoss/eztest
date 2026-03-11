-- AlterTable (use IF NOT EXISTS to avoid conflicts)
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "featureCategory" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "moduleCategory" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TestCase_moduleCategory_idx" ON "TestCase"("moduleCategory");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TestCase_featureCategory_idx" ON "TestCase"("featureCategory");
