-- Step 1: Remove default values that reference enum types
ALTER TABLE "TestCase" 
  ALTER COLUMN "priority" DROP DEFAULT,
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "TestRun" 
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Requirement" 
  ALTER COLUMN "priority" DROP DEFAULT,
  ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Defect" 
  ALTER COLUMN "severity" DROP DEFAULT,
  ALTER COLUMN "priority" DROP DEFAULT,
  ALTER COLUMN "status" DROP DEFAULT;

-- Step 2: Convert enum columns to text using CAST
ALTER TABLE "TestCase" 
  ALTER COLUMN "priority" TYPE TEXT USING priority::TEXT,
  ALTER COLUMN "status" TYPE TEXT USING status::TEXT;

ALTER TABLE "TestRun" 
  ALTER COLUMN "status" TYPE TEXT USING status::TEXT;

ALTER TABLE "TestResult" 
  ALTER COLUMN "status" TYPE TEXT USING status::TEXT;

ALTER TABLE "Requirement" 
  ALTER COLUMN "priority" TYPE TEXT USING priority::TEXT,
  ALTER COLUMN "status" TYPE TEXT USING status::TEXT;

ALTER TABLE "Defect" 
  ALTER COLUMN "severity" TYPE TEXT USING severity::TEXT,
  ALTER COLUMN "priority" TYPE TEXT USING priority::TEXT,
  ALTER COLUMN "status" TYPE TEXT USING status::TEXT;

-- Step 3: Add back default values as text literals
ALTER TABLE "TestCase" 
  ALTER COLUMN "priority" SET DEFAULT 'MEDIUM',
  ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

ALTER TABLE "TestRun" 
  ALTER COLUMN "status" SET DEFAULT 'PLANNED';

ALTER TABLE "Requirement" 
  ALTER COLUMN "priority" SET DEFAULT 'MEDIUM',
  ALTER COLUMN "status" SET DEFAULT 'DRAFT';

ALTER TABLE "Defect" 
  ALTER COLUMN "severity" SET DEFAULT 'MEDIUM',
  ALTER COLUMN "priority" SET DEFAULT 'MEDIUM',
  ALTER COLUMN "status" SET DEFAULT 'NEW';

-- Step 4: Drop the enum types
DROP TYPE IF EXISTS "Priority" CASCADE;
DROP TYPE IF EXISTS "TestStatus" CASCADE;
DROP TYPE IF EXISTS "TestRunStatus" CASCADE;
DROP TYPE IF EXISTS "TestResultStatus" CASCADE;
DROP TYPE IF EXISTS "RequirementStatus" CASCADE;
DROP TYPE IF EXISTS "DefectSeverity" CASCADE;
DROP TYPE IF EXISTS "DefectStatus" CASCADE;

-- CreateIndex: Add indexes for new text columns
CREATE INDEX IF NOT EXISTS "TestCase_priority_idx" ON "TestCase"("priority");
CREATE INDEX IF NOT EXISTS "TestRun_environment_idx" ON "TestRun"("environment");
CREATE INDEX IF NOT EXISTS "Requirement_priority_idx" ON "Requirement"("priority");
CREATE INDEX IF NOT EXISTS "Defect_priority_idx" ON "Defect"("priority");
CREATE INDEX IF NOT EXISTS "Defect_environment_idx" ON "Defect"("environment");

