/*
  Warnings:

  - The values [OPEN,RETEST,REOPENED] on the enum `DefectStatus` will be removed. If these variants are still used in the database, this will fail.

*/

-- Step 1: Convert status column to text temporarily
ALTER TABLE "Defect" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Defect" ALTER COLUMN "status" TYPE TEXT;

-- Step 2: Update existing data to map old statuses to new ones
UPDATE "Defect" SET "status" = 'NEW' WHERE "status" = 'OPEN';
UPDATE "Defect" SET "status" = 'TESTED' WHERE "status" = 'RETEST';
UPDATE "Defect" SET "status" = 'NEW' WHERE "status" = 'REOPENED';

-- Step 3: Drop old enum and create new enum
DROP TYPE "DefectStatus";
CREATE TYPE "DefectStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'FIXED', 'TESTED', 'CLOSED');

-- Step 4: Convert status column back to enum
ALTER TABLE "Defect" ALTER COLUMN "status" TYPE "DefectStatus" USING ("status"::text::"DefectStatus");
ALTER TABLE "Defect" ALTER COLUMN "status" SET DEFAULT 'NEW';
