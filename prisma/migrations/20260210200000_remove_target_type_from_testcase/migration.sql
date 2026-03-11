-- DropColumn: Remove targetType (対象) from TestCase
ALTER TABLE "TestCase" DROP COLUMN IF EXISTS "targetType";

-- Drop enum type TargetType
DROP TYPE IF EXISTS "TargetType";
