import { agentTestConfigController } from "@/backend/controllers/agent-test-config/controller";
import { hasPermission } from "@/lib/rbac";

/** POST /api/agent-test-configs/:id/generate-tests
 *  Reads the config's system prompt, calls Claude, generates 21 test cases
 *  across 7 categories, persists them, and returns the full list.
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    return agentTestConfigController.generateTests(request, id);
  },
  "agent_testing",
  "create",
);

/** GET /api/agent-test-configs/:id/generate-tests
 *  Returns previously generated test cases for a config without re-generating.
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    return agentTestConfigController.getTestCases(request, id);
  },
  "agent_testing",
  "read",
);
