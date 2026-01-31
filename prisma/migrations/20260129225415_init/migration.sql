-- CreateEnum
CREATE TYPE "TestLayer" AS ENUM ('SMOKE', 'CORE', 'EXTENDED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "TargetType" AS ENUM ('FUNCTIONAL', 'NON_FUNCTIONAL', 'PERFORMANCE', 'SECURITY', 'USABILITY', 'COMPATIBILITY', 'API', 'SCREEN');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('IOS', 'ANDROID', 'WEB');

-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "assertionId" TEXT,
ADD COLUMN     "evidence" TEXT,
ADD COLUMN     "expected" TEXT,
ADD COLUMN     "flowId" TEXT,
ADD COLUMN     "isAutomated" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "layer" "TestLayer",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "operation" TEXT,
ADD COLUMN     "platforms" "Platform"[] DEFAULT ARRAY[]::"Platform"[],
ADD COLUMN     "rtcId" TEXT,
ADD COLUMN     "targetType" "TargetType";
