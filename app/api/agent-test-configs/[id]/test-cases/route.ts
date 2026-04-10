import { agentTestConfigController } from "@/backend/controllers/agent-test-config/controller";
import { hasPermission } from "@/lib/rbac";

/** POST /api/agent-test-configs/:id/test-cases
 *  Manually create a single test case for a config.
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    return agentTestConfigController.createTestCase(request, id);
  },
  "agent_testing",
  "create",
);
