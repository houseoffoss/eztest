import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/testruns/[id]
 * Get a single test run by ID
 * Required permission: testruns:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testRunController.getTestRunById(id, request.userInfo.id);
  },
  'testruns',
  'read'
);

/**
 * PATCH /api/testruns/[id]
 * Update a test run
 * Required permission: testruns:update
 */
export const PATCH = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testRunController.updateTestRun(request, id, request.userInfo.id);
  },
  'testruns',
  'update'
);

/**
 * DELETE /api/testruns/[id]
 * Delete a test run
 * Required permission: testruns:delete
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testRunController.deleteTestRun(id, request.userInfo.id);
  },
  'testruns',
  'delete'
);
