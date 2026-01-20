import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/projects/[id]/testruns/import-xml
 * Import TestNG XML results - checks XML first, creates test run only if matches found, then uploads
 * Required permission: testruns:create
 * 
 * Supports two formats:
 * 1. Raw XML (Content-Type: application/xml):
 *    Send XML content directly in request body
 *    Query params: ?environment=ENV_NAME (required), ?filename=test-results.xml (optional), ?name=CustomName (optional)
 * 
 * 2. JSON (Content-Type: application/json):
 *    {
 *      "xmlContent": "<testng-results>...</testng-results>",
 *      "environment": "ENV_NAME" (required),
 *      "filename": "test-results.xml" (optional, for name generation),
 *      "name": "Custom Test Run Name" (optional, overrides filename-based generation)
 *    }
 * 
 * Behavior matches exactly the test run page upload:
 * - Checks XML for matching test cases first
 * - If no matches found, returns error and does NOT create test run
 * - If matches found, creates test run with generated name and uploads XML
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id: projectId } = await context!.params;
    const contentType = request.headers.get('content-type') || '';
    const searchParams = new URL(request.url).searchParams;
    
    let xmlContent: string;
    let name: string | undefined;
    let filename: string | undefined;
    let environment: string | undefined;

    // Check if request is raw XML
    if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
      try {
        xmlContent = await request.text();
      } catch (error) {
        return Response.json(
          { error: 'Failed to read XML content from request body' },
          { status: 400 }
        );
      }

      // Get parameters from query params for raw XML
      environment = searchParams.get('environment') || undefined;
      filename = searchParams.get('filename') || undefined;
      name = searchParams.get('name') || undefined;
    } else {
      // Try to parse as JSON
      let body: { 
        xmlContent?: string; 
        name?: string;
        filename?: string;
        environment?: string;
      };
      try {
        body = await request.json();
      } catch (error) {
        return Response.json(
          { error: 'Invalid request body. Expected JSON with xmlContent field or raw XML with Content-Type: application/xml' },
          { status: 400 }
        );
      }

      if (!body.xmlContent) {
        return Response.json(
          { error: 'xmlContent is required in request body' },
          { status: 400 }
        );
      }

      if (typeof body.xmlContent !== 'string') {
        return Response.json(
          { error: 'xmlContent must be a string' },
          { status: 400 }
        );
      }

      xmlContent = body.xmlContent;
      name = body.name;
      filename = body.filename;
      environment = body.environment;
    }

    // Validate XML content is not empty
    if (!xmlContent || xmlContent.trim().length === 0) {
      return Response.json(
        { error: 'XML content cannot be empty' },
        { status: 400 }
      );
    }

    // Validate environment is provided (required for test run creation)
    if (!environment) {
      return Response.json(
        { error: 'environment is required. Provide it in query params (?environment=ENV_NAME) or in JSON body' },
        { status: 400 }
      );
    }

    // Step 1: Check XML for matching test cases (same as UI)
    const checkResult = await testRunController.checkXMLMatches(
      xmlContent,
      projectId
    );

    const { matchCount = 0, totalTestMethods = 0 } = checkResult.data || {};

    // Step 2: If no matches found, don't create test run (exact same behavior as UI)
    if (matchCount === 0) {
      return Response.json(
        { 
          error: `No matching items found. The file contains ${totalTestMethods} item(s), but none match existing records.`
        },
        { status: 400 }
      );
    }

    // Step 3: Generate test run name (same logic as UI)
    if (!name) {
      if (filename) {
        // Generate name from filename with date (same as UploadTestNGXMLDialog)
        const nameWithoutExt = filename.replace(/\.xml$/i, '');
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        name = `${nameWithoutExt}_${dateStr}`;
      } else {
        // Fallback if no filename provided
        const date = new Date();
        const dateStr = date.toISOString().split('T')[0];
        name = `TestRun_${dateStr}`;
      }
    }

    // Step 4: Create test run (exact same body format as UI)
    const createBody = {
      name,
      description: filename 
        ? `Test run created from XML file: ${filename}` 
        : `Test run created from XML import`,
      status: 'COMPLETED',
      environment,
      testCaseIds: [],
    };

    const createResult = await testRunController.createTestRun(
      createBody,
      projectId,
      request.userInfo.id
    );

    const createData = createResult.data;
    if (!createData || !createData.id) {
      return Response.json(
        { error: 'Failed to create test run' },
        { status: 500 }
      );
    }

    const testRunId = createData.id;

    // Step 5: Upload XML to the created test run (same as UI)
    const uploadResult = await testRunController.uploadTestNGXML(
      xmlContent,
      testRunId,
      request.userInfo.id
    );

    // Return the exact same format as upload endpoint (same as UI expects)
    return uploadResult;
  },
  'testruns',
  'create'
);

