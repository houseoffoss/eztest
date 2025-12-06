-- Create TestCaseDefect join table for many-to-many relationship
CREATE TABLE "TestCaseDefect" (
  "id" TEXT NOT NULL,
  "testCaseId" TEXT NOT NULL,
  "defectId" TEXT NOT NULL,
  "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TestCaseDefect_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint to prevent duplicate links
CREATE UNIQUE INDEX "TestCaseDefect_testCaseId_defectId_key" ON "TestCaseDefect"("testCaseId", "defectId");

-- Create indexes for performance
CREATE INDEX "TestCaseDefect_testCaseId_idx" ON "TestCaseDefect"("testCaseId");
CREATE INDEX "TestCaseDefect_defectId_idx" ON "TestCaseDefect"("defectId");

-- Add foreign key constraints
ALTER TABLE "TestCaseDefect" ADD CONSTRAINT "TestCaseDefect_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TestCaseDefect" ADD CONSTRAINT "TestCaseDefect_defectId_fkey" FOREIGN KEY ("defectId") REFERENCES "Defect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate existing data from Defect.testCaseId to TestCaseDefect table
INSERT INTO "TestCaseDefect" ("id", "testCaseId", "defectId", "linkedAt")
SELECT 
  gen_random_uuid()::text,
  "testCaseId",
  "id",
  "createdAt"
FROM "Defect"
WHERE "testCaseId" IS NOT NULL;

-- Drop the old testCaseId column and its index
DROP INDEX IF EXISTS "Defect_testCaseId_idx";
ALTER TABLE "Defect" DROP COLUMN "testCaseId";
