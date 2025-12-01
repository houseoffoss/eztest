import { testSuiteController } from '@/backend/controllers/testsuite/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/projects/[id]/testsuites/[suiteId]/update-module
 * Update module for a test suite (change module assignment)
 * Required permission: testsuites:update
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id, suiteId } = await context!.params;
    return testSuiteController.updateSuiteModule(request, suiteId, id);
  },
  'testsuites',
  'update'
);
