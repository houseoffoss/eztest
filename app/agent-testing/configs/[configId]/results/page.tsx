import AgentTestHistory from "@/frontend/components/agent-testing/AgentTestHistory";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Run History | Agent Testing | EZTest",
  description: "View all test run history for this agent configuration.",
};

export default async function AgentTestResultsPage({
  params,
}: {
  params: Promise<{ configId: string }>;
}) {
  const { configId } = await params;
  return <AgentTestHistory configId={configId} />;
}
