import { agentTestConfigController } from "@/backend/controllers/agent-test-config/controller";
import { hasPermission } from "@/lib/rbac";

/** GET /api/agent-test-runs/:runId
 *  Returns the current state of a test run including all result details.
 *  Poll this endpoint every 2-3 seconds while status === "running".
 */
export const GET = hasPermission(
  async (request, context) => {
    const { runId } = await context.params;
    return agentTestConfigController.getRun(request, runId);
  },
  "agent_testing",
  "read",
);
