-- AlterTable (use IF NOT EXISTS to avoid conflicts with later migrations)
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "domain" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "function" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TestCase_domain_idx" ON "TestCase"("domain");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "TestCase_function_idx" ON "TestCase"("function");
