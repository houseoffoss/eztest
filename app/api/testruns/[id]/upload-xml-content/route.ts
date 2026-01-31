import { testRunController } from '@/backend/controllers/testrun/controller';
import { hasPermission } from '@/lib/rbac';

/**
 * POST /api/testruns/[id]/upload-xml-content
 * Upload and parse TestNG XML results by sending XML content directly
 * Required permission: testruns:update
 * 
 * Supports two formats:
 * 1. Raw XML (Content-Type: application/xml):
 *    Send XML content directly in request body
 * 
 * 2. JSON (Content-Type: application/json):
 *    {
 *      "xmlContent": "<testng-results>...</testng-results>"
 *    }
 */
export const POST = hasPermission(
  async (request, context) => {
    const { id } = await context!.params;
    const contentType = request.headers.get('content-type') || '';
    
    let xmlContent: string;

    // Check if request is raw XML
    if (contentType.includes('application/xml') || contentType.includes('text/xml')) {
      try {
        xmlContent = await request.text();
      } catch {
        return Response.json(
          { error: 'Failed to read XML content from request body' },
          { status: 400 }
        );
      }
    } else {
      // Try to parse as JSON
      let body: { xmlContent?: string };
      try {
        body = await request.json();
      } catch {
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
    }

    // Validate XML content is not empty
    if (!xmlContent || xmlContent.trim().length === 0) {
      return Response.json(
        { error: 'XML content cannot be empty' },
        { status: 400 }
      );
    }

    return testRunController.uploadTestNGXML(
      xmlContent,
      id,
      request.userInfo.id
    );
  },
  'testruns',
  'update'
);

