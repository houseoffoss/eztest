/*
  Warnings:

  - You are about to drop the column `expected` on the `TestCase` table. All the data in the column will be lost.
  - You are about to drop the column `operation` on the `TestCase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TestCase" DROP COLUMN "expected",
DROP COLUMN "operation";
