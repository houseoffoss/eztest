-- Add testMode to control whether agent generates single-turn, multi-turn, or both test types
-- Add multiTurnSessionId for persistent session management across multi-turn test runs
ALTER TABLE "AgentTestConfig" ADD COLUMN "testMode" TEXT NOT NULL DEFAULT 'both';
ALTER TABLE "AgentTestConfig" ADD COLUMN "multiTurnSessionId" TEXT;
