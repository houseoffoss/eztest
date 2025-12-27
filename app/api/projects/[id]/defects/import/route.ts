import { NextResponse } from 'next/server';
import { defectMigrationController } from '@/backend/controllers/migration/defect-migration.controller';
import { hasPermission } from '@/lib/rbac/hasPermission';
import { CustomRequest } from '@/backend/utils/interceptor';

/**
 * @route POST /api/projects/:id/defects/import
 * @desc Import defects from CSV or Excel file
 * @access Private - Project member with write access
 */
export const POST = hasPermission(
  async (req: CustomRequest, context: { params: Promise<{ id: string }> }) => {
    try {
      const { id: projectId } = await context.params;
      const response = await defectMigrationController.importDefects(
        req,
        projectId
      );
      return NextResponse.json(response, { status: 200 });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Import failed';
      return NextResponse.json({ success: false, message }, { status: 400 });
    }
  },
  'defects',
  'create'
);
