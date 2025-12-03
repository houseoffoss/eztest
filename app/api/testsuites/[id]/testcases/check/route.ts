import { testSuiteController } from '@/backend/controllers/testsuite/controller';
import { hasPermission } from '@/lib/rbac';
import { NextRequest } from 'next/server';

/**
 * POST /api/testsuites/[id]/testcases/check
 * Check which test cases from a list are in this suite
 * Required permission: testcases:read
 */
export const POST = hasPermission(
  async (request: NextRequest, context) => {
    const { id: suiteId } = await context.params;
    return testSuiteController.checkTestCasesInSuite(request, suiteId);
  },
  'testcases',
  'read'
);
