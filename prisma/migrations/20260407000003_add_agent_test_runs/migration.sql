-- CreateTable
CREATE TABLE "AgentTestRun" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "totalCases" INTEGER NOT NULL DEFAULT 0,
    "completedCases" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,

    CONSTRAINT "AgentTestRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentTestResult" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "agentResponse" TEXT,
    "httpStatus" INTEGER,
    "latencyMs" INTEGER,
    "errorMessage" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentTestResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentTestRun_configId_idx" ON "AgentTestRun"("configId");

-- CreateIndex
CREATE INDEX "AgentTestRun_createdById_idx" ON "AgentTestRun"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "AgentTestResult_sessionId_key" ON "AgentTestResult"("sessionId");

-- CreateIndex
CREATE INDEX "AgentTestResult_runId_idx" ON "AgentTestResult"("runId");

-- CreateIndex
CREATE INDEX "AgentTestResult_testCaseId_idx" ON "AgentTestResult"("testCaseId");

-- CreateIndex
CREATE INDEX "AgentTestResult_sessionId_idx" ON "AgentTestResult"("sessionId");

-- AddForeignKey
ALTER TABLE "AgentTestRun" ADD CONSTRAINT "AgentTestRun_configId_fkey" FOREIGN KEY ("configId") REFERENCES "AgentTestConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTestRun" ADD CONSTRAINT "AgentTestRun_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTestResult" ADD CONSTRAINT "AgentTestResult_runId_fkey" FOREIGN KEY ("runId") REFERENCES "AgentTestRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentTestResult" ADD CONSTRAINT "AgentTestResult_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "AgentTestCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
