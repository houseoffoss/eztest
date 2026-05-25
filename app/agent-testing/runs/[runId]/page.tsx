import AgentTestRunResults from "@/frontend/components/agent-testing/AgentTestRunResults";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Run Results | EZTest",
  description:
    "View agent test run results, AQS score breakdown, and trace details.",
};

interface Props {
  params: Promise<{ runId: string }>;
}

export default async function AgentTestRunResultsPage({ params }: Props) {
  const { runId } = await params;
  return <AgentTestRunResults runId={runId} />;
}
