-- DropColumn: Remove isAutomated (自動化) from TestCase
ALTER TABLE "TestCase" DROP COLUMN IF EXISTS "isAutomated";
