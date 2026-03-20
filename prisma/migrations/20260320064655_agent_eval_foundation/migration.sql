-- CreateTable
CREATE TABLE "EvalTarget" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inputType" TEXT NOT NULL,
    "endpoint" TEXT,
    "repoUrl" TEXT,
    "repoBranch" TEXT,
    "systemPrompt" TEXT,
    "toolSchema" JSONB,
    "agentType" TEXT,
    "traceStrategy" TEXT,
    "langfuseKey" TEXT,
    "configYaml" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvalTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvalRun" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "agentState" JSONB,
    "compositeScore" DOUBLE PRECISION,
    "verdict" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "EvalRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvalTestCase" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "expectedTools" JSONB,
    "expectedOutput" TEXT,
    "invariants" JSONB,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvalTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvalReview" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "feedback" TEXT,
    "editedTests" JSONB,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" TEXT,

    CONSTRAINT "EvalReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvalResult" (
    "id" TEXT NOT NULL,
    "testCaseId" TEXT NOT NULL,
    "verdict" TEXT NOT NULL,
    "compositeScore" DOUBLE PRECISION,
    "factualAccuracy" DOUBLE PRECISION,
    "toolUseCorrectness" BOOLEAN,
    "instructionFollowing" DOUBLE PRECISION,
    "safety" BOOLEAN,
    "consistency" DOUBLE PRECISION,
    "latency" BOOLEAN,
    "latencyMs" INTEGER,
    "rawResponse" TEXT,
    "traceData" JSONB,
    "judgeReasoning" TEXT,
    "invariantViolation" TEXT,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvalResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvalReport" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "runScore" DOUBLE PRECISION NOT NULL,
    "categoryScores" JSONB NOT NULL,
    "failurePatterns" JSONB NOT NULL,
    "suggestions" TEXT NOT NULL,
    "regressionDiff" JSONB,
    "markdownPath" TEXT,
    "htmlPath" TEXT,
    "jsonPath" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvalReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EvalRun_targetId_idx" ON "EvalRun"("targetId");

-- CreateIndex
CREATE INDEX "EvalTestCase_runId_idx" ON "EvalTestCase"("runId");

-- CreateIndex
CREATE INDEX "EvalReview_runId_idx" ON "EvalReview"("runId");

-- CreateIndex
CREATE UNIQUE INDEX "EvalResult_testCaseId_key" ON "EvalResult"("testCaseId");

-- CreateIndex
CREATE UNIQUE INDEX "EvalReport_runId_key" ON "EvalReport"("runId");

-- AddForeignKey
ALTER TABLE "EvalRun" ADD CONSTRAINT "EvalRun_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "EvalTarget"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvalTestCase" ADD CONSTRAINT "EvalTestCase_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EvalRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvalReview" ADD CONSTRAINT "EvalReview_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EvalRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvalResult" ADD CONSTRAINT "EvalResult_testCaseId_fkey" FOREIGN KEY ("testCaseId") REFERENCES "EvalTestCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvalReport" ADD CONSTRAINT "EvalReport_runId_fkey" FOREIGN KEY ("runId") REFERENCES "EvalRun"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
