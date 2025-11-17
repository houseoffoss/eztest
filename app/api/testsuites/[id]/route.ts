import { testSuiteController } from '@/backend/controllers/testsuite/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * GET /api/testsuites/[id]
 * Get a single test suite by ID
 * Required permission: testsuites:read
 */
export const GET = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testSuiteController.getTestSuiteById(id, request.userInfo.id);
  },
  'testsuites',
  'read'
);

/**
 * PATCH /api/testsuites/[id]
 * Update a test suite
 * Required permission: testsuites:update
 */
export const PATCH = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testSuiteController.updateTestSuite(request, id, request.userInfo.id);
  },
  'testsuites',
  'update'
);

/**
 * DELETE /api/testsuites/[id]
 * Delete a test suite
 * Required permission: testsuites:delete
 */
export const DELETE = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    return testSuiteController.deleteTestSuite(id, request.userInfo.id);
  },
  'testsuites',
  'delete'
);
