import { testPlanController } from '@/backend/controllers/testplan/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/projects/[id]/testplans
 * Get all test plans for a project
 * Required permission: testplans:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testPlanController.getProjectTestPlans(id, request.userInfo.id);
  },
  'testplans',
  'read'
);

/**
 * POST /api/projects/[id]/testplans
 * Create a new test plan for a project
 * Required permission: testplans:create
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testPlanController.createTestPlan(request, id, request.userInfo.id);
  },
  'testplans',
  'create'
);
