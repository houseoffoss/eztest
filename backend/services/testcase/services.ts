import { prisma } from '@/lib/prisma';
import { Priority, TestStatus } from '@prisma/client';

interface CreateTestCaseInput {
  projectId: string;
  suiteId?: string;
  title: string;
  description?: string;
  expectedResult?: string;
  priority?: Priority;
  status?: TestStatus;
  estimatedTime?: number;
  preconditions?: string;
  postconditions?: string;
  createdById: string;
  steps?: Array<{
    stepNumber: number;
    action: string;
    expectedResult: string;
  }>;
}

interface UpdateTestCaseInput {
  title?: string;
  description?: string;
  expectedResult?: string;
  priority?: Priority;
  status?: TestStatus;
  estimatedTime?: number;
  preconditions?: string;
  postconditions?: string;
  suiteId?: string | null;
}

interface TestCaseFilters {
  suiteId?: string;
  priority?: Priority;
  status?: TestStatus;
  search?: string;
}

export class TestCaseService {
  /**
   * Generate next test case ID for a project (e.g., tc1, tc2, tc3...)
   */
  private async generateTestCaseId(projectId: string): Promise<string> {
    // Get the count of existing test cases in the project
    const count = await prisma.testCase.count({
      where: { projectId },
    });
    
    // Generate tcId as tc1, tc2, tc3, etc.
    return `tc${count + 1}`;
  }

  /**
   * Get all test cases for a project with optional filters
   */
  async getProjectTestCases(
    projectId: string,
    filters?: TestCaseFilters
  ) {
    // Build where clause
    const where: Record<string, unknown> = {
      projectId,
    };

    if (filters?.suiteId) {
      where.suiteId = filters.suiteId;
    }

    if (filters?.priority) {
      where.priority = filters.priority;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.testCase.findMany({
      where,
      include: {
        suite: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            steps: true,
            results: true,
            requirements: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get test case by ID with full details
   * Scope filtering applied via project membership check
   */
  async getTestCaseById(testCaseId: string, userId: string, scope: string) {
    // Build query to check access based on scope
    let whereClause: Record<string, unknown> = { id: testCaseId };

    if (scope === 'project') {
      whereClause = {
        ...whereClause,
        project: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      };
    }
    // 'all' scope: no additional filtering

    const testCase = await prisma.testCase.findFirst({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        suite: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        steps: {
          orderBy: {
            stepNumber: 'asc',
          },
        },
        requirements: {
          select: {
            id: true,
            key: true,
            title: true,
            priority: true,
            status: true,
          },
        },
        _count: {
          select: {
            results: true,
            comments: true,
            attachments: true,
          },
        },
      },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    return testCase;
  }

  /**
   * Create a new test case
   */
  async createTestCase(data: CreateTestCaseInput) {
    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
    });

    if (!project || project.isDeleted) {
      throw new Error('Project not found');
    }

    // Verify suite exists if provided
    if (data.suiteId) {
      const suite = await prisma.testSuite.findUnique({
        where: { id: data.suiteId },
      });

      if (!suite || suite.projectId !== data.projectId) {
        throw new Error('Test suite not found or does not belong to this project');
      }
    }

    // Generate unique test case ID
    const tcId = await this.generateTestCaseId(data.projectId);

    // Create test case with steps
    const testCase = await prisma.testCase.create({
      data: {
        tcId,
        projectId: data.projectId,
        suiteId: data.suiteId,
        title: data.title,
        description: data.description,
        expectedResult: data.expectedResult,
        priority: data.priority || 'MEDIUM',
        status: data.status || 'DRAFT',
        estimatedTime: data.estimatedTime,
        preconditions: data.preconditions,
        postconditions: data.postconditions,
        createdById: data.createdById,
        steps: data.steps
          ? {
              create: data.steps.map((step) => ({
                stepNumber: step.stepNumber,
                action: step.action,
                expectedResult: step.expectedResult,
              })),
            }
          : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        suite: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        steps: {
          orderBy: {
            stepNumber: 'asc',
          },
        },
      },
    });

    return testCase;
  }

  /**
   * Update test case
   * Scope filtering: verify user has access before updating
   */
  async updateTestCase(testCaseId: string, userId: string, scope: string, data: UpdateTestCaseInput) {
    // Build where clause based on scope
    let whereClause: Record<string, unknown> = { id: testCaseId };

    if (scope === 'project') {
      whereClause = {
        ...whereClause,
        project: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      };
    }
    // 'all' scope: no additional filtering

    // Check if test case exists and user has access
    const existing = await prisma.testCase.findFirst({
      where: whereClause,
    });

    if (!existing) {
      throw new Error('Test case not found or access denied');
    }

    // Verify suite if being changed
    if (data.suiteId !== undefined) {
      if (data.suiteId) {
        const suite = await prisma.testSuite.findUnique({
          where: { id: data.suiteId },
        });

        if (!suite || suite.projectId !== existing.projectId) {
          throw new Error('Test suite not found or does not belong to this project');
        }
      }
      // If suiteId is null, it's valid - just removing from suite
    }

    const updateData: Record<string, unknown> = {};
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.expectedResult !== undefined) updateData.expectedResult = data.expectedResult;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.estimatedTime !== undefined) updateData.estimatedTime = data.estimatedTime;
    if (data.preconditions !== undefined) updateData.preconditions = data.preconditions;
    if (data.postconditions !== undefined) updateData.postconditions = data.postconditions;
    if (data.suiteId !== undefined) updateData.suiteId = data.suiteId;

    return await prisma.testCase.update({
      where: { id: testCaseId },
      data: updateData,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        suite: {
          select: {
            id: true,
            name: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        steps: {
          orderBy: {
            stepNumber: 'asc',
          },
        },
      },
    });
  }

  /**
   * Delete test case
   * Scope filtering: verify user has access before deleting
   */
  async deleteTestCase(testCaseId: string, userId: string, scope: string) {
    // Build where clause based on scope
    let whereClause: Record<string, unknown> = { id: testCaseId };

    if (scope === 'project') {
      whereClause = {
        ...whereClause,
        project: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      };
    }
    // 'all' scope: no additional filtering

    const testCase = await prisma.testCase.findFirst({
      where: whereClause,
    });

    if (!testCase) {
      throw new Error('Test case not found or access denied');
    }

    // Delete test case (steps will cascade)
    return await prisma.testCase.delete({
      where: { id: testCaseId },
    });
  }

  /**
   * Add/Update test steps
   * Scope filtering: verify user has access before updating
   */
  async updateTestSteps(
    testCaseId: string,
    userId: string,
    scope: string,
    steps: Array<{
      id?: string;
      stepNumber: number;
      action: string;
      expectedResult: string;
    }>
  ) {
    // Build where clause based on scope
    let whereClause: Record<string, unknown> = { id: testCaseId };

    if (scope === 'project') {
      whereClause = {
        ...whereClause,
        project: {
          members: {
            some: {
              userId: userId,
            },
          },
        },
      };
    }
    // 'all' scope: no additional filtering

    // Verify test case exists and user has access
    const testCase = await prisma.testCase.findFirst({
      where: whereClause,
    });

    if (!testCase) {
      throw new Error('Test case not found or access denied');
    }

    // Delete existing steps
    await prisma.testStep.deleteMany({
      where: { testCaseId },
    });

    // Create new steps
    if (steps.length > 0) {
      await prisma.testStep.createMany({
        data: steps.map((step) => ({
          testCaseId,
          stepNumber: step.stepNumber,
          action: step.action,
          expectedResult: step.expectedResult,
        })),
      });
    }

    // Return updated test case (pass userId and scope for access check)
    return await this.getTestCaseById(testCaseId, userId, scope);
  }



  /**
   * Get test case statistics for a project
   */
  async getProjectTestCaseStats(projectId: string) {
    const [total, byPriority, byStatus] = await Promise.all([
      prisma.testCase.count({
        where: { projectId },
      }),
      prisma.testCase.groupBy({
        by: ['priority'],
        where: { projectId },
        _count: true,
      }),
      prisma.testCase.groupBy({
        by: ['status'],
        where: { projectId },
        _count: true,
      }),
    ]);

    return {
      total,
      byPriority: byPriority.reduce((acc, item) => {
        acc[item.priority] = item._count;
        return acc;
      }, {} as Record<string, number>),
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
    };
  }
}

export const testCaseService = new TestCaseService();
