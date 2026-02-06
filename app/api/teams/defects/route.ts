import { defectController } from '@/backend/controllers/defect/controller';
import { hasProjectAccess } from '@/lib/teams/user-mapper';
import { NextRequest } from 'next/server';

/**
 * POST /api/teams/defects
 * Create a defect from Teams bot
 * 
 * Internal API for Teams bot - uses userId in body instead of session
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      projectId,
      title,
      description,
      severity,
      priority,
      status,
      assignedToId,
      linkedTestCaseId,
    } = body;

    // Validate required fields
    if (!userId || !projectId || !title) {
      return Response.json(
        { error: 'Missing required fields: userId, projectId, title' },
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
      json: async () => ({
        title,
        description,
        severity,
        priority,
        status,
        assignedToId,
        linkedTestCaseId,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // Call the defect controller
    const result = await defectController.createDefect(mockRequest, projectId, {
      title,
      description,
      severity,
      priority,
      status,
      assignedToId,
      linkedTestCaseId,
    });
    // Controller returns plain object, need to wrap in Response
    return Response.json(result);
  } catch (error) {
    console.error('Error creating defect from Teams:', error);
    return Response.json(
      { error: 'Failed to create defect', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/teams/defects
 * List defects for a project
 * 
 * Internal API for Teams bot - uses userId in query params instead of session
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const projectId = searchParams.get('projectId');
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    // Call the defect controller (no query params for filtering)
    const queryParams = {};
    const result = await defectController.getProjectDefects(mockRequest, projectId, queryParams);
    
    // Limit results manually if needed
    const limitNum = parseInt(limit);
    if (result.data && Array.isArray(result.data) && limitNum > 0) {
      result.data = result.data.slice(0, limitNum);
    }
    
    // Controller returns plain object, need to wrap in Response
    return Response.json(result);
  } catch (error) {
    console.error('Error fetching defects from Teams:', error);
    return Response.json(
      { error: 'Failed to fetch defects', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

