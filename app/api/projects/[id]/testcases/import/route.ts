import { NextResponse } from 'next/server';
import { testCaseMigrationController } from '@/backend/controllers/migration/testcase-migration.controller';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { CustomRequest } from '@/backend/utils/interceptor';

/**
 * @route POST /api/projects/:id/testcases/import
 * @desc Import test cases from CSV or Excel file
 * @access Private - Project member with write access
 */
export const POST = hasPermission(
  async (req: CustomRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id: projectId } = await context.params;
      const response = await testCaseMigrationController.importTestCases(
        req,
        projectId
      );
      return NextResponse.json(response, { status: 200 });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Import failed';
      return NextResponse.json({ success: false, message }, { status: 400 });
    }
  },
  'testcases',
  'create'
);
