import { NextRequest, NextResponse } from 'next/server';
import { testCaseMigrationController } from '@/backend/controllers/migration/testcase-migration.controller';

/**
 * @route GET /api/projects/:id/testcases/import/template
 * @desc Get import template for test cases
 * @access Public
 */
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const response = await testCaseMigrationController.getImportTemplate();
    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate template';
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
