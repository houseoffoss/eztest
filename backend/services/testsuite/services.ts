import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Use explicit, DB-safe field selection for suite detail queries.
// Some environments may not have newly added TestCase columns yet.
const TEST_SUITE_TEST_CASE_SELECT = {
  id: true,
  tcId: true,
  projectId: true,
  moduleId: true,
  suiteId: true,
  title: true,
  description: true,
  priority: true,
  status: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
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
      defects: true,
    },
  },
} as const;

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
              select: { testCaseSuites: true },
            },
          },
        },
        testCaseSuites: {
          include: {
            testCase: {
              select: {
                id: true,
                tcId: true,
                title: true,
                description: true,
                priority: true,
                status: true,
                moduleId: true,
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
        },
        _count: {
          select: { testCaseSuites: true },
        },
      },
      orderBy: [
        { order: 'asc' },
        { name: 'asc' },
      ],
    });

    // Transform the data to maintain backward compatibility
    const transformedSuites = suites.map(suite => ({
      ...suite,
      testCases: suite.testCaseSuites.map(tcs => tcs.testCase),
      _count: {
        ...suite._count,
        testCases: suite._count.testCaseSuites,
      },
      children: suite.children.map(child => ({
        ...child,
        _count: {
          ...child._count,
          testCases: child._count.testCaseSuites,
        },
      })),
    }));

    return transformedSuites;
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
              select: { testCaseSuites: true },
            },
          },
          orderBy: [
            { order: 'asc' },
            { name: 'asc' },
          ],
        },
        testCaseSuites: {
          include: {
            testCase: {
              select: TEST_SUITE_TEST_CASE_SELECT,
            },
          },
          orderBy: { testCase: { module: { name: 'asc' } } },
        },
        _count: {
          select: { 
            testCaseSuites: true,
            children: true,
          },
        },
      },
    });

    if (!suite) return null;

    // Transform the data to maintain backward compatibility
    const transformedSuite = {
      ...suite,
      testCases: suite.testCaseSuites.map(tcs => ({
        ...tcs.testCase,
        suiteId: suite.id, // Add suiteId for backward compatibility
      })),
      _count: {
        ...suite._count,
        testCases: suite._count.testCaseSuites,
      },
    };

    return transformedSuite;
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
          select: { testCaseSuites: true },
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
      description?: string | null;
      parentId?: string | null;
      order?: number;
    }
  ) {
    const updatePayload: {
      name?: string;
      description?: string | null;
      parentId?: string | null;
      order?: number;
    } = {};

    if (Object.prototype.hasOwnProperty.call(data, 'name')) {
      updatePayload.name = data.name;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'description')) {
      updatePayload.description = data.description;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'parentId')) {
      updatePayload.parentId = data.parentId;
    }
    if (Object.prototype.hasOwnProperty.call(data, 'order')) {
      updatePayload.order = data.order;
    }

    const suite = await prisma.testSuite.update({
      where: { id: suiteId },
      data: updatePayload,
      include: {
        parent: true,
        _count: {
          select: { testCaseSuites: true },
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
            testCaseSuites: true,
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
   * Add test cases to a suite (many-to-many relationship)
   */
  async addTestCasesToSuite(testCaseIds: string[], suiteId: string) {
    // Create TestCaseSuite records for each test case
    // Use createMany with skipDuplicates to avoid errors if already added
    const result = await prisma.testCaseSuite.createMany({
      data: testCaseIds.map(testCaseId => ({
        testCaseId,
        testSuiteId: suiteId,
      })),
      skipDuplicates: true,
    });

    return { success: true, count: result.count };
  }

  /**
   * Remove test cases from a suite
   */
  async removeTestCasesFromSuite(testCaseIds: string[], suiteId: string) {
    const result = await prisma.testCaseSuite.deleteMany({
      where: {
        testCaseId: {
          in: testCaseIds,
        },
        testSuiteId: suiteId,
      },
    });

    return { success: true, count: result.count };
  }

  /**
   * Check which test cases from a list are in this suite
   */
  async checkTestCasesInSuite(testCaseIds: string[], suiteId: string) {
    // Find which test cases are in this suite (check both new join table and legacy suiteId)
    const testCaseSuites = await prisma.testCaseSuite.findMany({
      where: {
        testSuiteId: suiteId,
        testCaseId: {
          in: testCaseIds,
        },
      },
      select: {
        testCaseId: true,
      },
    });

    // Also check legacy suiteId field for backward compatibility
    const testCasesWithLegacySuiteId = await prisma.testCase.findMany({
      where: {
        id: {
          in: testCaseIds,
        },
        suiteId: suiteId,
      },
      select: {
        id: true,
      },
    });

    // Combine both sources
    const testCaseIdsFromJoinTable = new Set(testCaseSuites.map(tcs => tcs.testCaseId));
    const testCaseIdsFromLegacy = new Set(testCasesWithLegacySuiteId.map(tc => tc.id));
    const allTestCaseIdsInSuite = [...testCaseIdsFromJoinTable, ...testCaseIdsFromLegacy];
    
    // Remove duplicates
    const uniqueTestCaseIds = [...new Set(allTestCaseIdsInSuite)];

    return { testCaseIds: uniqueTestCaseIds };
  }

  /**
   * Get available modules and test cases for adding to a suite
   */
  async getAvailableTestCases(suiteId: string) {
    // Get all test cases already in this suite
    const testCasesInSuite = await prisma.testCaseSuite.findMany({
      where: { testSuiteId: suiteId },
      select: { testCaseId: true },
    });
    const testCaseIdsInSuite = new Set(testCasesInSuite.map(tc => tc.testCaseId));

    // Also check legacy suiteId field
    const legacyTestCases = await prisma.testCase.findMany({
      where: { suiteId },
      select: { id: true },
    });
    legacyTestCases.forEach(tc => testCaseIdsInSuite.add(tc.id));

    // Get the project ID from the suite
    const suite = await prisma.testSuite.findUnique({
      where: { id: suiteId },
      select: { projectId: true },
    });

    if (!suite) {
      throw new Error('Test suite not found');
    }

    // Fetch all modules with their test cases in one query
    const modules = await prisma.module.findMany({
      where: { projectId: suite.projectId },
      include: {
        testCases: {
          orderBy: { flowId: 'asc' },
        },
        _count: {
          select: { testCases: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Fetch ungrouped test cases
    const ungroupedTestCases = await prisma.testCase.findMany({
      where: {
        projectId: suite.projectId,
        moduleId: null,
      },
      orderBy: { flowId: 'asc' },
    });

    // Filter out test cases already in this suite
    const modulesWithAvailableTestCases = modules
      .map(module => ({
        ...module,
        testCases: module.testCases.filter(tc => !testCaseIdsInSuite.has(tc.id)),
      }))
      .filter(module => module.testCases.length > 0);

    // Add ungrouped test cases if any are available
    const availableUngroupedTestCases = ungroupedTestCases.filter(
      tc => !testCaseIdsInSuite.has(tc.id)
    );

    if (availableUngroupedTestCases.length > 0) {
      modulesWithAvailableTestCases.push({
        id: 'ungrouped',
        name: 'Ungrouped Test Cases',
        description: 'Test cases not assigned to any module',
        projectId: suite.projectId,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 9999,
        testCases: availableUngroupedTestCases,
        _count: { testCases: availableUngroupedTestCases.length },
      });
    }

    return modulesWithAvailableTestCases;
  }

  /**
   * Move test cases to a suite (legacy - kept for backward compatibility)
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
        testCaseSuites: {
          include: {
            testCase: {
              select: TEST_SUITE_TEST_CASE_SELECT,
            },
          },
        },
      },
    });

    // Transform to maintain backward compatibility
    const transformed = {
      ...updatedSuite,
      testCases: updatedSuite?.testCaseSuites.map(tcs => tcs.testCase) || [],
    };

    return transformed;
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
        testCaseSuites: {
          include: {
            testCase: {
              select: TEST_SUITE_TEST_CASE_SELECT,
            },
          },
        },
      },
    });

    // Transform to maintain backward compatibility
    const transformed = {
      ...updatedSuite,
      testCases: updatedSuite?.testCaseSuites.map(tcs => tcs.testCase) || [],
    };

    return transformed;
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
        testCaseSuites: {
          include: {
            testCase: {
              select: TEST_SUITE_TEST_CASE_SELECT,
            },
          },
        },
      },
    });

    // Transform to maintain backward compatibility
    const transformed = {
      ...updatedSuite,
      testCases: updatedSuite?.testCaseSuites.map(tcs => tcs.testCase) || [],
    };

    return transformed;
  }
}

export const testSuiteService = new TestSuiteService();
