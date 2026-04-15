import { agentTestConfigController } from "@/backend/controllers/agent-test-config/controller";
import { hasPermission } from "@/lib/rbac";

/** POST /api/agent-test-runs/:runId/resume
 *  Resumes a paused test run. The background worker continues from where
 *  it left off. Run status returns to "running".
 */
export const POST = hasPermission(
  async (request, context) => {
    const { runId } = await context.params;
    return agentTestConfigController.resumeRun(request, runId);
  },
  "agent_testing",
  "update",
);
