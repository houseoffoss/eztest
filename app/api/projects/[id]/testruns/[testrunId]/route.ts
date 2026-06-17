import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

export const GET = hasPermission(
  async (request, context) => {
    const { testrunId } = await context.params;
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get('page') || '1');
    const limit = Number(searchParams.get('limit') || '50');

    const rawStatusFilter = searchParams.get('resultStatus');
    const rawExecutedByFilter = searchParams.get('executedById');
    const rawStatusSort = searchParams.get('resultStatusSort');

    const resultStatusSort: 'asc' | 'desc' | undefined =
      rawStatusSort === 'asc' || rawStatusSort === 'desc' ? rawStatusSort : undefined;

    const filters: {
      resultStatus?: string;
      executedById?: string;
      resultStatusSort?: 'asc' | 'desc';
    } = {
      resultStatus: rawStatusFilter && rawStatusFilter !== 'all' ? rawStatusFilter : undefined,
      executedById: rawExecutedByFilter && rawExecutedByFilter !== 'all' ? rawExecutedByFilter : undefined,
      resultStatusSort,
    };

    return testRunController.getTestRunById(testrunId, request.userInfo.id, page, limit, filters);
  },
  'testruns',
  'read'
);

export const PUT = hasPermission(
  async (request, context) => {
    const { testrunId } = await context.params;
    const body = await request.json();
    return testRunController.updateTestRun(body, testrunId);
  },
  'testruns',
  'update'
);

export const DELETE = hasPermission(
  async (request, context) => {
    const { testrunId } = await context.params;
    return testRunController.deleteTestRun(testrunId);
  },
  'testruns',
  'delete'
);

