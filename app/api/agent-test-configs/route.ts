import { agentTestConfigController } from "@/backend/controllers/agent-test-config/controller";
import { hasPermission } from "@/lib/rbac";

/** GET /api/agent-test-configs - List all agent test configurations for current user */
export const GET = hasPermission(
  async (request) => agentTestConfigController.list(request),
  "agent_testing",
  "read",
);

/** POST /api/agent-test-configs - Create a new agent test configuration */
export const POST = hasPermission(
  async (request) => agentTestConfigController.create(request),
  "agent_testing",
  "create",
);
