-- CreateEnum
CREATE TYPE "DefectSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "DefectStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'FIXED', 'RETEST', 'CLOSED', 'REOPENED');

-- CreateTable
CREATE TABLE "Defect" (
    "id" TEXT NOT NULL,
    "defectId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "severity" "DefectSeverity" NOT NULL DEFAULT 'MEDIUM',
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "DefectStatus" NOT NULL DEFAULT 'OPEN',
    "assignedToId" TEXT,
    "testCaseId" TEXT,
    "testRunId" TEXT,
    "environment" TEXT,
    "stepsToReproduce" TEXT,
    "actualResult" TEXT,
    "expectedResult" TEXT,
    "createdById" TEXT NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Defect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefectAttachment" (
    "id" TEXT NOT NULL,
    "defectId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DefectAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefectComment" (
    "id" TEXT NOT NULL,
    "defectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DefectComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Defect_projectId_idx" ON "Defect"("projectId");

-- CreateIndex
CREATE INDEX "Defect_assignedToId_idx" ON "Defect"("assignedToId");

-- CreateIndex
CREATE INDEX "Defect_createdById_idx" ON "Defect"("createdById");

-- CreateIndex
CREATE INDEX "Defect_testCaseId_idx" ON "Defect"("testCaseId");

-- CreateIndex
CREATE INDEX "Defect_testRunId_idx" ON "Defect"("testRunId");

-- CreateIndex
CREATE INDEX "Defect_status_idx" ON "Defect"("status");

-- CreateIndex
CREATE INDEX "Defect_severity_idx" ON "Defect"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "Defect_projectId_defectId_key" ON "Defect"("projectId", "defectId");

-- CreateIndex
CREATE INDEX "DefectAttachment_defectId_idx" ON "DefectAttachment"("defectId");

-- CreateIndex
CREATE INDEX "DefectComment_defectId_idx" ON "DefectComment"("defectId");

-- CreateIndex
CREATE INDEX "DefectComment_userId_idx" ON "DefectComment"("userId");

-- AddForeignKey
ALTER TABLE "Defect" ADD CONSTRAINT "Defect_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Defect" ADD CONSTRAINT "Defect_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Defect" ADD CONSTRAINT "Defect_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Defect" ADD CONSTRAINT "Defect_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "TestCase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Defect" ADD CONSTRAINT "Defect_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "TestRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectAttachment" ADD CONSTRAINT "DefectAttachment_defectId_fkey" FOREIGN KEY ("defectId") REFERENCES "Defect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectComment" ADD CONSTRAINT "DefectComment_defectId_fkey" FOREIGN KEY ("defectId") REFERENCES "Defect"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DefectComment" ADD CONSTRAINT "DefectComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
