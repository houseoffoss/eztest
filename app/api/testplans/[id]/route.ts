import { testPlanController } from '@/backend/controllers/testplan/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/testplans/[id]
 * Get a single test plan by ID
 * Required permission: testplans:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testPlanController.getTestPlanById(id, request.userInfo.id);
  },
  'testplans',
  'read'
);

/**
 * PATCH /api/testplans/[id]
 * Update a test plan
 * Required permission: testplans:update
 */
export const PATCH = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testPlanController.updateTestPlan(request, id, request.userInfo.id);
  },
  'testplans',
  'update'
);

/**
 * DELETE /api/testplans/[id]
 * Delete a test plan
 * Required permission: testplans:delete
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testPlanController.deleteTestPlan(id, request.userInfo.id);
  },
  'testplans',
  'delete'
);
