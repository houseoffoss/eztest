-- AlterTable
-- AlterTable (use IF NOT EXISTS to avoid conflicts with earlier domain migration)
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "domain" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "functionName" TEXT;
