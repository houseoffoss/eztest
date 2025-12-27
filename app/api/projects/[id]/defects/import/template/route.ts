import { NextResponse } from 'next/server';
import { defectMigrationController } from '@/backend/controllers/migration/defect-migration.controller';

/**
 * @route GET /api/projects/:id/defects/import/template
 * @desc Get import template for defects
 * @access Public
 */
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const response = await defectMigrationController.getImportTemplate();
    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate template';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
