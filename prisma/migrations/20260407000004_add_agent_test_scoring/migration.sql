-- AlterTable: add Langfuse trace + scoring fields to AgentTestResult
ALTER TABLE "AgentTestResult"
  ADD COLUMN "langfuseTraceId"   TEXT,
  ADD COLUMN "traceJson"         TEXT,
  ADD COLUMN "traceFetchedAt"    TIMESTAMP(3),
  ADD COLUMN "traceFetchError"   TEXT,
  ADD COLUMN "rubricScores"      TEXT,   -- JSON: { criterion: string, pass: boolean, reason: string }[]
  ADD COLUMN "passCount"         INTEGER,
  ADD COLUMN "failCount"         INTEGER,
  ADD COLUMN "scoredAt"          TIMESTAMP(3),
  ADD COLUMN "scoreError"        TEXT;
