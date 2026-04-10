import AgentTestCasesPage from "@/frontend/components/agent-testing/AgentTestCasesPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Test Cases | Agent Testing | EZTest",
  description: "View, manage, and run test cases for an agent configuration.",
};

export default async function TestCasesPage({
  params,
}: {
  params: Promise<{ configId: string }>;
}) {
  const { configId } = await params;
  return <AgentTestCasesPage configId={configId} />;
}
