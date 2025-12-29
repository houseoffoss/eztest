import { NextResponse } from 'next/server';
import { migrationController } from '@/backend/controllers/migration/controller';

/**
 * @route GET /api/projects/:id/testcases/import/template
 * @desc Get import template for test cases
 * @access Public
 */
export async function GET() {
  const response = migrationController.getTestCaseImportTemplate();
  return NextResponse.json(response, { status: 200 });
}
