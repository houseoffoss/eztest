import { agentTestConfigController } from "@/backend/controllers/agent-test-config/controller";
import { hasPermission } from "@/lib/rbac";

/** PATCH /api/agent-test-cases/:testCaseId
 *  Update a single test case (title, input, rubric, expectedBehavior, category).
 */
export const PATCH = hasPermission(
  async (request, context) => {
    const { testCaseId } = await context.params;
    return agentTestConfigController.updateTestCase(request, testCaseId);
  },
  "agent_testing",
  "update",
);

/** DELETE /api/agent-test-cases/:testCaseId
 *  Delete a single test case.
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { testCaseId } = await context.params;
    return agentTestConfigController.deleteTestCase(request, testCaseId);
  },
  "agent_testing",
  "delete",
);
