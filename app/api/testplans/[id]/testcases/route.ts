import { testPlanController } from '@/backend/controllers/testplan/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/testplans/[id]/testcases
 * Add test cases to a test plan
 * Required permission: testplans:update
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testPlanController.addTestCasesToPlan(request, id, request.userInfo.id);
  },
  'testplans',
  'update'
);

/**
 * DELETE /api/testplans/[id]/testcases
 * Remove test cases from a test plan
 * Required permission: testplans:update
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testPlanController.removeTestCasesFromPlan(request, id, request.userInfo.id);
  },
  'testplans',
  'update'
);
