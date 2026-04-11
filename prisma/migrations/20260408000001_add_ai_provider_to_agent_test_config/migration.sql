-- AddColumn aiProvider and aiApiKey to AgentTestConfig
ALTER TABLE "AgentTestConfig" ADD COLUMN "aiProvider" TEXT NOT NULL DEFAULT 'anthropic';
ALTER TABLE "AgentTestConfig" ADD COLUMN "aiApiKey" TEXT;
