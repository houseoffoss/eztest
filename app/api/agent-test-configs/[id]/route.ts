import { agentTestConfigController } from "@/backend/controllers/agent-test-config/controller";
import { hasPermission } from "@/lib/rbac";

/** GET /api/agent-test-configs/:id - Get agent test configuration by ID */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    return agentTestConfigController.getById(request, id);
  },
  "agent_testing",
  "read",
);

/** PATCH /api/agent-test-configs/:id - Update agent test configuration */
export const PATCH = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    return agentTestConfigController.update(request, id);
  },
  "agent_testing",
  "update",
);

/** DELETE /api/agent-test-configs/:id - Delete agent test configuration */
export const DELETE = hasPermission(
  async (request, context) => {
    const { id } = await context.params;
    return agentTestConfigController.delete(request, id);
  },
  "agent_testing",
  "delete",
);
