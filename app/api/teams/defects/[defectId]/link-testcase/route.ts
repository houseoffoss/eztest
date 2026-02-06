import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasProjectAccess } from '@/lib/teams/user-mapper';

/**
 * POST /api/teams/defects/[defectId]/link-testcase
 * Link a defect to a test case from Teams bot
 * 
 * Internal API for Teams bot - uses userId in body instead of session
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ defectId: string }> }
) {
  try {
    const { defectId } = await params;
    const body = await request.json();
    const { userId, testCaseId } = body;

    // Validate required fields
    if (!userId || !testCaseId) {
      return Response.json(
        { error: 'Missing required fields: userId, testCaseId' },
        { status: 400 }
      );
    }

    // Get defect to find projectId
    const defect = await prisma.defect.findUnique({
      where: { id: defectId },
      select: { projectId: true },
    });

    if (!defect) {
      return Response.json(
        { error: 'Defect not found' },
        { status: 404 }
      );
    }

    // Verify test case exists and belongs to same project
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
      select: { projectId: true },
    });

    if (!testCase) {
      return Response.json(
        { error: 'Test case not found' },
        { status: 404 }
      );
    }

    if (testCase.projectId !== defect.projectId) {
      return Response.json(
        { error: 'Test case and defect must belong to the same project' },
        { status: 400 }
      );
    }

    // Check user has access to project
    const hasAccess = await hasProjectAccess(userId, defect.projectId);
    if (!hasAccess) {
      return Response.json(
        { error: 'User does not have access to this project' },
        { status: 403 }
      );
    }

    // Link defect to test case using many-to-many relationship
    // Check if link already exists
    const existingLink = await prisma.testCaseDefect.findUnique({
      where: {
        testCaseId_defectId: {
          testCaseId,
          defectId,
        },
      },
    });

    if (existingLink) {
      // Link already exists, return existing defect with test cases
      const defect = await prisma.defect.findUnique({
        where: { id: defectId },
        include: {
          testCases: {
            include: {
              testCase: {
                select: {
                  id: true,
                  title: true,
                  tcId: true,
                },
              },
            },
          },
        },
      });

      return Response.json({
        data: {
          id: defect?.id,
          testCases: defect?.testCases.map((tc) => tc.testCase),
        },
      });
    }

    // Create new link
    await prisma.testCaseDefect.create({
      data: {
        testCaseId,
        defectId,
      },
    });

    // Fetch updated defect with test cases
    const updatedDefect = await prisma.defect.findUnique({
      where: { id: defectId },
      include: {
        testCases: {
          include: {
            testCase: {
              select: {
                id: true,
                title: true,
                tcId: true,
              },
            },
          },
        },
      },
    });

    return Response.json({
      data: {
        id: updatedDefect?.id,
        testCases: updatedDefect?.testCases.map((tc) => tc.testCase),
      },
    });
  } catch (error) {
    console.error('Error linking defect to test case from Teams:', error);
    return Response.json(
      { error: 'Failed to link defect to test case', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

