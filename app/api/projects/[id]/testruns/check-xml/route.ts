import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/projects/[id]/testruns/check-xml
 * Check how many test cases will match from XML (without importing)
 * Required permission: testruns:read
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return Response.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.xml')) {
      return Response.json(
        { error: 'Invalid file type. Please upload an XML file.' },
        { status: 400 }
      );
    }

    // Read file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const xmlContent = buffer.toString('utf-8');

    return testRunController.checkXMLMatches(
      xmlContent,
      id
    );
  },
  'testruns',
  'read'
);

