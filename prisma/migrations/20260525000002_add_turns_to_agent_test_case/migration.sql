-- Add multi-turn support: stores JSON array of conversation turns for multi_turn test cases
ALTER TABLE "AgentTestCase" ADD COLUMN "turns" TEXT;
