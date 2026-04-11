-- AlterTable: add AQS (Agent Quality Score) columns to AgentTestRun
ALTER TABLE "AgentTestRun"
  ADD COLUMN "aqsScore"            DOUBLE PRECISION,
  ADD COLUMN "aqsCorrectness"      DOUBLE PRECISION,
  ADD COLUMN "aqsToolUse"         DOUBLE PRECISION,
  ADD COLUMN "aqsLatency"         DOUBLE PRECISION,
  ADD COLUMN "aqsErrorRate"       DOUBLE PRECISION,
  ADD COLUMN "aqsTraceCoverage"   DOUBLE PRECISION,
  ADD COLUMN "aqsComputedAt"      TIMESTAMP(3),
  ADD COLUMN "aqsRegressionDelta" DOUBLE PRECISION;
