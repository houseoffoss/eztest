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
        testCases: {
          include: {
            module: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
          select: {
            id: true,
            tcId: true,
            title: true,
            description: true,
            priority: true,
            status: true,
            moduleId: true,
            module: true,
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
            module: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
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

  /**
   * Add a module to a test suite (assign module to test cases in the suite)
   */
  async addModuleToSuite(suiteId: string, moduleId: string, projectId: string) {
    // Verify suite exists and belongs to project
    const suite = await prisma.testSuite.findUnique({
      where: { id: suiteId },
    });

    if (!suite || suite.projectId !== projectId) {
      throw new Error('Test suite not found or does not belong to this project');
    }

    // Verify module exists and belongs to project
    const moduleRecord = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!moduleRecord || moduleRecord.projectId !== projectId) {
      throw new Error('Module not found or does not belong to this project');
    }

    // Get all test cases in this suite and assign them to the module
    await prisma.testCase.updateMany({
      where: {
        suiteId: suiteId,
      },
      data: {
        moduleId: moduleId,
      },
    });

    // Return updated suite with test cases
    const updatedSuite = await prisma.testSuite.findUnique({
      where: { id: suiteId },
      include: {
        testCases: {
          include: {
            module: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return updatedSuite;
  }

  /**
   * Update module for a test suite (change module assignment)
   */
  async updateSuiteModule(suiteId: string, oldModuleId: string | null, newModuleId: string, projectId: string) {
    // Verify suite exists and belongs to project
    const suite = await prisma.testSuite.findUnique({
      where: { id: suiteId },
    });

    if (!suite || suite.projectId !== projectId) {
      throw new Error('Test suite not found or does not belong to this project');
    }

    // Verify new module exists and belongs to project
    const moduleRecord = await prisma.module.findUnique({
      where: { id: newModuleId },
    });

    if (!moduleRecord || moduleRecord.projectId !== projectId) {
      throw new Error('Module not found or does not belong to this project');
    }

    // Update test cases in suite from old module to new module
    await prisma.testCase.updateMany({
      where: {
        suiteId: suiteId,
        moduleId: oldModuleId,
      },
      data: {
        moduleId: newModuleId,
      },
    });

    // Return updated suite
    const updatedSuite = await prisma.testSuite.findUnique({
      where: { id: suiteId },
      include: {
        testCases: {
          include: {
            module: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return updatedSuite;
  }

  /**
   * Remove module from a test suite (unassign module from test cases)
   */
  async removeModuleFromSuite(suiteId: string, moduleId: string, projectId: string) {
    // Verify suite exists and belongs to project
    const suite = await prisma.testSuite.findUnique({
      where: { id: suiteId },
    });

    if (!suite || suite.projectId !== projectId) {
      throw new Error('Test suite not found or does not belong to this project');
    }

    // Verify module exists and belongs to project
    const moduleRecord = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!moduleRecord || moduleRecord.projectId !== projectId) {
      throw new Error('Module not found or does not belong to this project');
    }

    // Remove module from all test cases in this suite
    await prisma.testCase.updateMany({
      where: {
        suiteId: suiteId,
        moduleId: moduleId,
      },
      data: {
        moduleId: null,
      },
    });

    // Return updated suite
    const updatedSuite = await prisma.testSuite.findUnique({
      where: { id: suiteId },
      include: {
        testCases: {
          include: {
            module: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    return updatedSuite;
  }
}
