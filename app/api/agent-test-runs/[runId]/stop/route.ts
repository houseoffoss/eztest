import { agentTestConfigController } from "@/backend/controllers/agent-test-config/controller";
import { hasPermission } from "@/lib/rbac";

/** POST /api/agent-test-runs/:runId/stop
 *  Stops a running test run. The background worker aborts after the current
 *  test case finishes. Run status becomes "stopped".
 */
export const POST = hasPermission(
  async (request, context) => {
    const { runId } = await context.params;
    return agentTestConfigController.stopRun(request, runId);
  },
  "agent_testing",
  "update",
);
