-- AlterTable (use IF NOT EXISTS to avoid conflicts)
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "platform" TEXT;
