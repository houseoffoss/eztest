import { agentTestConfigController } from "@/backend/controllers/agent-test-config/controller";
import { hasPermission } from "@/lib/rbac";

/** POST /api/agent-test-configs/:id/run-tests
 *  Starts a new test run — calls the agent API for every generated test case.
 *  Returns immediately with the run record (status: "running") and result stubs.
 *  Poll GET /api/agent-test-runs/:runId for live progress.
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    return agentTestConfigController.startRun(request, id);
  },
  "agent_testing",
  "create",
);

/** GET /api/agent-test-configs/:id/run-tests
 *  Lists all test runs for a config (latest first), without full result details.
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    return agentTestConfigController.listRuns(request, id);
  },
  "agent_testing",
  "read",
);
