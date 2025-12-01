import { testSuiteController } from '@/backend/controllers/testsuite/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/projects/[id]/testsuites/[suiteId]/remove-module
 * Remove module from a test suite
 * Required permission: testsuites:update
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id, suiteId } = await context!.params;
    return testSuiteController.removeModuleFromSuite(request, suiteId, id);
  },
  'testsuites',
  'update'
);
