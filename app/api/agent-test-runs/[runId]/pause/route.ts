import { agentTestConfigController } from "@/backend/controllers/agent-test-config/controller";
import { hasPermission } from "@/lib/rbac";

/** POST /api/agent-test-runs/:runId/pause
 *  Pauses a running test run. The background worker waits before starting
 *  the next test case. Run status becomes "paused".
 */
export const POST = hasPermission(
  async (request, context) => {
    const { runId } = await context.params;
    return agentTestConfigController.pauseRun(request, runId);
  },
  "agent_testing",
  "update",
);
