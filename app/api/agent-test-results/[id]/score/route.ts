import { agentTestConfigController } from "@/backend/controllers/agent-test-config/controller";
import { hasPermission } from "@/lib/rbac";

/** POST /api/agent-test-results/:id/score
 *  Manually re-fetches the Langfuse trace and re-scores a single result
 *  against its rubric. Useful when the initial scoring failed or the
 *  trace was not yet available at execution time.
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    return agentTestConfigController.rescoreResult(request, id);
  },
  "agent_testing",
  "write",
);
