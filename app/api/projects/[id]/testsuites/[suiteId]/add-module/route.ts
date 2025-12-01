import { testSuiteController } from '@/backend/controllers/testsuite/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/projects/[id]/testsuites/[suiteId]/add-module
 * Add a module to a test suite
 * Required permission: testsuites:update
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id, suiteId } = await context!.params;
    return testSuiteController.addModuleToSuite(request, suiteId, id);
  },
  'testsuites',
  'update'
);
