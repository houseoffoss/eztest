import { prisma } from '@/lib/prisma';
import { Priority, TestStatus, UserRole } from '@prisma/client';

interface CreateTestCaseInput {
  projectId: string;
  suiteId?: string;
  title: string;
  description?: string;
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
  priority?: Priority;
  status?: TestStatus;
  estimatedTime?: number;
  preconditions?: string;
  postconditions?: string;
  suiteId?: string;
}

interface TestCaseFilters {
  suiteId?: string;
  priority?: Priority;
  status?: TestStatus;
  search?: string;
}

export class TestCaseService {
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
   */
  async getTestCaseById(testCaseId: string) {
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
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

    // Create test case with steps
    const testCase = await prisma.testCase.create({
      data: {
        projectId: data.projectId,
        suiteId: data.suiteId,
        title: data.title,
        description: data.description,
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
      },
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
   */
  async updateTestCase(testCaseId: string, data: UpdateTestCaseInput) {
    // Check if test case exists
    const existing = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!existing) {
      throw new Error('Test case not found');
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
    }

    return await prisma.testCase.update({
      where: { id: testCaseId },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        estimatedTime: data.estimatedTime,
        preconditions: data.preconditions,
        postconditions: data.postconditions,
        suiteId: data.suiteId,
      },
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
   */
  async deleteTestCase(testCaseId: string) {
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    // Delete test case (steps will cascade)
    return await prisma.testCase.delete({
      where: { id: testCaseId },
    });
  }

  /**
   * Add/Update test steps
   */
  async updateTestSteps(
    testCaseId: string,
    steps: Array<{
      id?: string;
      stepNumber: number;
      action: string;
      expectedResult: string;
    }>
  ) {
    // Verify test case exists
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      throw new Error('Test case not found');
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

    // Return updated test case
    return await this.getTestCaseById(testCaseId);
  }

  /**
   * Check if user has access to test case
   */
  async hasTestCaseAccess(testCaseId: string, userId: string, userRole: UserRole): Promise<boolean> {
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
      include: {
        project: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!testCase) {
      return false;
    }

    // Admins have access to everything
    if (userRole === 'ADMIN') {
      return true;
    }

    // Check if user is a project member
    return testCase.project.members.length > 0;
  }

  /**
   * Check if user can modify test case
   */
  async canModifyTestCase(testCaseId: string, userId: string, userRole: UserRole): Promise<boolean> {
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
      include: {
        project: {
          include: {
            members: {
              where: { userId },
            },
          },
        },
      },
    });

    if (!testCase) {
      return false;
    }

    // Admins can modify everything
    if (userRole === 'ADMIN') {
      return true;
    }

    // Check if user is project owner/admin
    const member = testCase.project.members[0];
    return member && (member.role === 'OWNER' || member.role === 'ADMIN' || member.role === 'TESTER');
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
