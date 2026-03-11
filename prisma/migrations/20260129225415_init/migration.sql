-- CreateEnum (only if not exists - allows re-run after partial apply)
DO $$ BEGIN
  CREATE TYPE "TestLayer" AS ENUM ('SMOKE', 'CORE', 'EXTENDED', 'UNKNOWN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "TargetType" AS ENUM ('FUNCTIONAL', 'NON_FUNCTIONAL', 'PERFORMANCE', 'SECURITY', 'USABILITY', 'COMPATIBILITY', 'API', 'SCREEN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "Platform" AS ENUM ('IOS', 'ANDROID', 'WEB');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable: add columns only if they don't exist (idempotent)
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "assertionId" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "evidence" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "expected" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "flowId" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "isAutomated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "layer" "TestLayer";
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "notes" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "operation" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "platforms" "Platform"[] DEFAULT ARRAY[]::"Platform"[];
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "rtcId" TEXT;
ALTER TABLE "TestCase" ADD COLUMN IF NOT EXISTS "targetType" "TargetType";
