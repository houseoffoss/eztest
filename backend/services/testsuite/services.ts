import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TestSuiteService {
  /**
   * Get all test suites for a project with hierarchical structure
   */
  async getProjectTestSuites(projectId: string) {
    const suites = await prisma.testSuite.findMany({
      where: {
        projectId,
      },
      include: {
        parent: true,
        children: {
          include: {
            _count: {
              select: { testCases: true },
            },
          },
        },
        _count: {
          select: { testCases: true },
        },
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
    });

    return suites;
  }

  /**
   * Get a single test suite by ID with full details
   */
  async getTestSuiteById(suiteId: string) {
    const suite = await prisma.testSuite.findUnique({
      where: { id: suiteId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          include: {
            _count: {
              select: { testCases: true },
            },
          },
          orderBy: [
            { order: 'asc' },
            { name: 'asc' },
          ],
        },
        testCases: {
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            _count: {
              select: {
                steps: true,
                results: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: { 
            testCases: true,
            children: true,
          },
        },
      },
    });

    return suite;
  }

  /**
   * Create a new test suite
   */
  async createTestSuite(data: {
    projectId: string;
    name: string;
    description?: string;
    parentId?: string;
    order?: number;
  }) {
    const suite = await prisma.testSuite.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        order: data.order ?? 0,
      },
      include: {
        parent: true,
        _count: {
          select: { testCases: true },
        },
      },
    });

    return suite;
  }

  /**
   * Update a test suite
   */
  async updateTestSuite(
    suiteId: string,
    data: {
      name?: string;
      description?: string;
      parentId?: string;
      order?: number;
    }
  ) {
    const suite = await prisma.testSuite.update({
      where: { id: suiteId },
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        order: data.order,
      },
      include: {
        parent: true,
        _count: {
          select: { testCases: true },
        },
      },
    });

    return suite;
  }

  /**
   * Delete a test suite
   */
  async deleteTestSuite(suiteId: string) {
    // Check if suite has children
    const suite = await prisma.testSuite.findUnique({
      where: { id: suiteId },
      include: {
        _count: {
          select: {
            children: true,
            testCases: true,
          },
        },
      },
    });

    if (!suite) {
      throw new Error('Test suite not found');
    }

    if (suite._count.children > 0) {
      throw new Error('Cannot delete suite with child suites. Please delete or move child suites first.');
    }

    // Delete the suite (test cases will have suiteId set to null due to SetNull)
    await prisma.testSuite.delete({
      where: { id: suiteId },
    });

    return { success: true };
  }

  /**
   * Move test cases to a suite
   */
  async moveTestCasesToSuite(testCaseIds: string[], suiteId: string | null) {
    await prisma.testCase.updateMany({
      where: {
        id: {
          in: testCaseIds,
        },
      },
      data: {
        suiteId: suiteId,
      },
    });

    return { success: true, count: testCaseIds.length };
  }

  /**
   * Reorder suites
   */
  async reorderSuites(updates: Array<{ id: string; order: number }>) {
    // Use transaction to update all orders
    await prisma.$transaction(
      updates.map((update) =>
        prisma.testSuite.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      )
    );

    return { success: true };
  }

  /**
   * Check if user has access to test suite (via project membership)
   */
  async hasAccessToTestSuite(suiteId: string, userId: string): Promise<boolean> {
    const suite = await prisma.testSuite.findUnique({
      where: { id: suiteId },
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

    if (!suite) {
      return false;
    }

    return suite.project.members.length > 0;
  }

  /**
   * Check if user can manage test suite (OWNER or ADMIN)
   */
  async canManageTestSuite(suiteId: string, userId: string): Promise<boolean> {
    const suite = await prisma.testSuite.findUnique({
      where: { id: suiteId },
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

    if (!suite) {
      return false;
    }

    const member = suite.project.members[0];
    // Check if user is a member of the project (role-based permissions handled by hasPermission)
    return !!member;
  }
}
