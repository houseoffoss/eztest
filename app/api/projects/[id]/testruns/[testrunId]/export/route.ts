import { exportController } from '@/backend/controllers/export/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { CustomRequest } from '@/backend/utils/interceptor';

/**
 * GET /api/projects/[id]/testruns/[testrunId]/export
 * Export a single test run with detailed report
 */
export const GET = hasPermission(
  async (req: CustomRequest, context) => {
    const { testrunId } = await context.params;
    const searchParams = req.nextUrl?.searchParams || new URL(req.url).searchParams;
    const format = (searchParams.get('format') || 'csv') as 'csv' | 'excel';
    
    return exportController.exportTestRunDetail(testrunId, format);
  },
  'testruns',
  'read'
);

