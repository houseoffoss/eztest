-- AlterTable
-- AlterTable (use IF NOT EXISTS to avoid conflicts)
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "executionType" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "automationStatus" TEXT;
