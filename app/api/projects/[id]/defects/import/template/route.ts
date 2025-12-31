import { NextResponse } from 'next/server';
import { migrationController } from '@/backend/controllers/migration/controller';

/**
 * @route GET /api/projects/:id/defects/import/template
 * @desc Get import template for defects
 * @access Public
 */
export async function GET() {
  const response = migrationController.getDefectImportTemplate();
  return NextResponse.json(response, { status: 200 });
}
