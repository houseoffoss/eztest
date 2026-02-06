import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasProjectAccess } from '@/lib/teams/user-mapper';

/**
 * POST /api/teams/testcases/[tcId]/comments
 * Add a comment to a test case from Teams bot
 * 
 * Internal API for Teams bot - uses userId in body instead of session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tcId: string }> }
) {
  try {
    const { tcId } = await params;
    const body = await request.json();
    const { userId, content } = body;

    // Validate required fields
    if (!userId || !content) {
      return Response.json(
        { error: 'Missing required fields: userId, content' },
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

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        testCaseId: tcId,
        userId: userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return Response.json({
      data: {
        id: comment.id,
        content: comment.content,
        testCaseId: comment.testCaseId,
        createdBy: comment.user,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error adding comment to test case from Teams:', error);
    return Response.json(
      { error: 'Failed to add comment', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/teams/testcases/[tcId]/comments
 * Get comments for a test case
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

    // Get comments
    const comments = await prisma.comment.findMany({
      where: { testCaseId: tcId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({
      data: comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        testCaseId: comment.testCaseId,
        createdBy: comment.user,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching test case comments from Teams:', error);
    return Response.json(
      { error: 'Failed to fetch comments', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

