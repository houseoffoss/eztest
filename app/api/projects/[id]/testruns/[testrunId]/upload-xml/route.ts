import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac/hasPermission';

/**
 * POST /api/projects/[id]/testruns/[testrunId]/upload-xml
 * Upload and parse TestNG XML results file
 */
export const POST = hasPermission(
  async (request, context) => {
    const { testrunId } = await context.params;
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

    return testRunController.uploadTestNGXML(
      xmlContent,
      testrunId,
      request.userInfo.id
    );
  },
  'testruns',
  'update'
);

