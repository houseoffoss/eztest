-- AlterTable
-- AlterTable (use IF NOT EXISTS to avoid conflicts)
ALTER TABLE "TestRun" ADD COLUMN IF NOT EXISTS "platform" TEXT;
ALTER TABLE "TestRun" ADD COLUMN IF NOT EXISTS "device" TEXT;
