import AgentTestResultsHistory from "@/frontend/components/agent-testing/AgentTestResultsHistory";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Results History | Agent Testing | EZTest",
  description: "View all test run results for an agent configuration.",
};

interface Props {
  params: Promise<{ configId: string }>;
}

export default async function ResultsHistoryPage({ params }: Props) {
  const { configId } = await params;
  return <AgentTestResultsHistory configId={configId} />;
}
