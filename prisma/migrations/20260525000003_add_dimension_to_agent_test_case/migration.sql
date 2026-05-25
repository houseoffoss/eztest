-- Add dimension field to tag test cases with the 7 QA dimensions from the Agentic QA Runbook
ALTER TABLE "AgentTestCase" ADD COLUMN "dimension" TEXT;
