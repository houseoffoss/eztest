-- AlterTable: Drop existing foreign key constraint
ALTER TABLE "TestCase" DROP CONSTRAINT IF EXISTS "TestCase_moduleId_fkey";

-- Add unique constraint on Module(id, projectId) for composite foreign key
ALTER TABLE "Module" ADD CONSTRAINT "Module_id_projectId_key" UNIQUE ("id", "projectId");

-- Add composite foreign key constraint on TestCase(moduleId, projectId) -> Module(id, projectId)
-- This ensures test cases can only reference modules within the same project
ALTER TABLE "TestCase" ADD CONSTRAINT "TestCase_moduleId_projectId_fkey" 
  FOREIGN KEY ("moduleId", "projectId") 
  REFERENCES "Module"("id", "projectId") 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;
