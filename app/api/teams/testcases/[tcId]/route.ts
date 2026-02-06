import { testCaseController } from '@/backend/controllers/testcase/controller';
import { hasProjectAccess } from '@/lib/teams/user-mapper';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/teams/testcases/[tcId]
 * Get test case details
 * 
 * Internal API for Teams bot - uses userId in query params instead of session
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tcId: string }> }
) {
  try {
    const { tcId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Validate required fields
    if (!userId) {
      return Response.json(
        { error: 'Missing required field: userId' },
        { status: 400 }
      );
    }

    // Get test case to find projectId
    const testCase = await prisma.testCase.findUnique({
      where: { id: tcId },
      select: { projectId: true },
    });

    if (!testCase) {
      return Response.json(
        { error: 'Test case not found' },
        { status: 404 }
      );
    }

    // Check user has access to project
    const hasAccess = await hasProjectAccess(userId, testCase.projectId);
    if (!hasAccess) {
      return Response.json(
        { error: 'User does not have access to this project' },
        { status: 403 }
      );
    }

    // Create a mock request object for the controller
    const mockRequest = {
      userInfo: { id: userId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // Call the test case controller
    const result = await testCaseController.getTestCaseById(mockRequest, tcId);
    // Controller returns plain object, need to wrap in Response
    return Response.json(result);
  } catch (error) {
    console.error('Error fetching test case from Teams:', error);
    return Response.json(
      { error: 'Failed to fetch test case', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

