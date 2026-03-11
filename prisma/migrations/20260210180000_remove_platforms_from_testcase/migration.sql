-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN IF EXISTS "platforms";

-- DropEnum
DROP TYPE IF EXISTS "Platform";
