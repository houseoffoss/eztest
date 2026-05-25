-- Add authentication fields to AgentTestConfig for authenticated API testing
ALTER TABLE "AgentTestConfig" ADD COLUMN "cookies" TEXT;
ALTER TABLE "AgentTestConfig" ADD COLUMN "authHeaders" TEXT;
