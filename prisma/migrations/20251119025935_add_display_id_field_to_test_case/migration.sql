/*
  Warnings:

  - Added the required column `displayId` to the `TestCase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TestCase" ADD COLUMN     "displayId" TEXT NOT NULL;
