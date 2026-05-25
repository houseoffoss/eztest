import { agentTestConfigController } from "@/backend/controllers/agent-test-config/controller";
import { hasPermission } from "@/lib/rbac";

/**
 * GET /api/agent-test-runs/:runId/aqs
 * Returns the stored AQS for the run. Returns { data: null } if not yet computed.
 */
export const GET = hasPermission(
  async (request, context) => {
    const { runId } = await context.params;
    return agentTestConfigController.getAqs(request, runId);
  },
  "agent_testing",
  "read",
);

/**
 * POST /api/agent-test-runs/:runId/aqs
 * Triggers (re-)computation of AQS for the run and returns the result.
 * Useful after a manual re-score or when auto-computation failed.
 */
export const POST = hasPermission(
  async (request, context) => {
    const { runId } = await context.params;
    return agentTestConfigController.computeAqs(request, runId);
  },
  "agent_testing",
  "write",
);
