import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const GET = hasPermission(
  async (request, context) => {
    const { id: projectId } = await context.params;
    
    // Check if pagination is requested
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    
    // If pagination parameters are present, use paginated endpoint
    if (page || limit) {
      return testCaseController.getProjectTestCasesWithPagination(request, projectId);
    }
    
    // Otherwise, use the original endpoint (for backwards compatibility)
    return testCaseController.getProjectTestCases(request, projectId);
  },
  'testcases',
  'read'
);

export const POST = hasPermission(
  async (request, context) => {
    const { id: projectId } = await context.params;
    return testCaseController.createTestCase(request, projectId);
  },
  'testcases',
  'create'
);
