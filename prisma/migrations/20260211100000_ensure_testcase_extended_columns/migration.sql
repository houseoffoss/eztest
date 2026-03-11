-- Ensure TestCase extended columns exist (idempotent)
-- Run this if "The column TestCase.platform does not exist" error occurs
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "platform" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "device" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "domain" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "functionName" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "executionType" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "automationStatus" TEXT;
