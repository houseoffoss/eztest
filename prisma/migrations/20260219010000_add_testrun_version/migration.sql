-- Add optional version field to test runs
ALTER TABLE "TestRun"
ADD COLUMN IF NOT EXISTS "version" TEXT;
