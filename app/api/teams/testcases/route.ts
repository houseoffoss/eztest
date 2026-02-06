import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasProjectAccess } from '@/lib/teams/user-mapper';
import { NextRequest } from 'next/server';

/**
 * POST /api/teams/testcases
 * Create a test case from Teams bot
 * 
 * Internal API for Teams bot - uses userId in body instead of session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, projectId, title, description, testData, priority, status, estimatedTime, preconditions, postconditions, expectedResult } = body;

    // Validate required fields
    if (!userId || !projectId || !title) {
      return Response.json(
        { error: 'Missing required fields: userId, projectId, title' },
        { status: 400 }
      );
    }

    // Check user has access to project (permission check done in handler)
    const hasAccess = await hasProjectAccess(userId, projectId);
    if (!hasAccess) {
      return Response.json(
        { error: 'User does not have access to this project' },
        { status: 403 }
      );
    }

    // Create a mock request object for the controller
    // The controller expects CustomRequest with userInfo
    const mockRequest = {
      userInfo: { id: userId },
      json: async () => ({
        title: title.trim(),
        description: description?.trim(),
        testData: testData?.trim(),
        priority: priority || 'MEDIUM',
        status: status || 'ACTIVE',
        estimatedTime: estimatedTime ? parseInt(String(estimatedTime)) : undefined,
        preconditions: preconditions?.trim(),
        postconditions: postconditions?.trim(),
        expectedResult: expectedResult?.trim(),
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // Call the test case controller
    const result = await testCaseController.createTestCase(mockRequest, projectId);
    
    // Return response with proper status code
    return Response.json(result, { 
      status: result.statusCode || 201 
    });
  } catch (error) {
    console.error('Error creating test case from Teams:', error);
    return Response.json(
      { error: 'Failed to create test case', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/teams/testcases
 * List test cases for a project (with pagination)
 * 
 * Internal API for Teams bot - uses userId in query params instead of session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';

    // Validate required fields
    if (!userId || !projectId) {
      return Response.json(
        { error: 'Missing required fields: userId, projectId' },
        { status: 400 }
      );
    }

    // Check user has access to project
    const hasAccess = await hasProjectAccess(userId, projectId);
    if (!hasAccess) {
      return Response.json(
        { error: 'User does not have access to this project' },
        { status: 403 }
      );
    }

    // Create a mock request object for the controller
    const mockRequest = {
      userInfo: { id: userId },
      nextUrl: {
        searchParams: new URLSearchParams({
          page,
          limit,
        }),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // Call the test case controller with pagination
    const result = await testCaseController.getProjectTestCasesWithPagination(mockRequest, projectId);
    // Controller returns plain object, need to wrap in Response
    return Response.json(result);
  } catch (error) {
    console.error('Error fetching test cases from Teams:', error);
    return Response.json(
      { error: 'Failed to fetch test cases', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

