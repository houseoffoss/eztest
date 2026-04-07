import AgentTestSetup from "@/frontend/components/agent-testing/AgentTestSetup";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Agent Testing Setup | EZTest",
  description:
    "Configure your agent API endpoint, Langfuse keys, and system prompt for AI agent testing.",
};

export default function AgentTestSetupPage() {
  return <AgentTestSetup />;
}
