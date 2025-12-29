import { exportController } from '@/backend/controllers/export/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { CustomRequest } from '@/backend/utils/interceptor';

/**
 * @route GET /api/testruns/:id/export
 * @desc Export a single test run with detailed report (test cases and defects) to CSV or Excel file
 * @access Private - Project member with read access
 */
export const GET = hasPermission(
  async (req: CustomRequest, context: { params: Promise<{ id: string }> }) => {
    const { id: testRunId } = await context.params;
    const searchParams = req.nextUrl?.searchParams || new URL(req.url).searchParams;
    const format = (searchParams.get('format') || 'csv') as 'csv' | 'excel';
    
    return exportController.exportTestRunDetail(testRunId, format);
  },
  'testruns',
  'read'
);

