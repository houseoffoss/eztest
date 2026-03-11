-- AlterTable (idempotent)
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "testType" TEXT;
