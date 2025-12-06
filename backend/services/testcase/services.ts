import { prisma } from '@/lib/prisma';
import { Priority, TestStatus } from '@prisma/client';

interface CreateTestCaseInput {
  projectId: string;
  moduleId?: string;
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
  moduleId?: string | null;
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
    
    // Start from count + 1 and find the first available ID
    let testCaseNumber = count + 1;
    let tcId = `tc${testCaseNumber}`;
    
    // Check if this ID already exists
    let exists = await prisma.testCase.findFirst({
      where: {
        projectId,
        tcId,
      },
    });
    
    // If exists, keep incrementing until we find an available ID
    while (exists) {
      testCaseNumber++;
      tcId = `tc${testCaseNumber}`;
      exists = await prisma.testCase.findFirst({
        where: {
          projectId,
          tcId,
        },
      });
    }
    
    return tcId;
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
        module: {
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
        module: {
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
        defects: {
          include: {
            defect: {
              select: {
                id: true,
                defectId: true,
                title: true,
                severity: true,
                priority: true,
                status: true,
              },
            },
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

    // Verify module exists if provided
    if (data.moduleId) {
      const moduleRecord = await prisma.module.findUnique({
        where: { id: data.moduleId },
      });

      if (!moduleRecord || moduleRecord.projectId !== data.projectId) {
        throw new Error('Module not found or does not belong to this project');
      }
    }

    // Generate unique test case ID with retry logic for race conditions
    let testCase;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      try {
        const tcId = await this.generateTestCaseId(data.projectId);

        // Create test case with steps
        testCase = await prisma.testCase.create({
          data: {
            tcId,
            projectId: data.projectId,
            moduleId: data.moduleId,
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
        break; // Success - exit retry loop
      } catch (error: unknown) {
        attempts++;
        // Check if it's a unique constraint error
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
          if (attempts >= maxAttempts) {
            throw new Error('Failed to generate unique test case ID after multiple attempts');
          }
          // Wait a bit before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 100 * attempts));
          continue;
        }
        // If it's not a unique constraint error, throw immediately
        throw error;
      }
    }

    if (!testCase) {
      throw new Error('Failed to create test case');
    }

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

    // Verify module if being changed
    if (data.moduleId !== undefined) {
      if (data.moduleId) {
        const moduleData = await prisma.module.findUnique({
          where: { id: data.moduleId },
        });

        if (!moduleData || moduleData.projectId !== existing.projectId) {
          throw new Error('Module not found or does not belong to this project');
        }
      }
      // If moduleId is null, it's valid - just removing from module
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
    if (data.moduleId !== undefined) updateData.moduleId = data.moduleId;

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
   * Get test case history (all test results across test runs)
   */
  async getTestCaseHistory(testCaseId: string, userId: string, scope: string) {
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
      throw new Error('Test case not found');
    }

    // Fetch test results for this test case across all test runs
    const results = await prisma.testResult.findMany({
      where: {
        testCaseId: testCaseId,
      },
      include: {
        executedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        testRun: {
          select: {
            id: true,
            name: true,
            environment: true,
            status: true,
          },
        },
      },
      orderBy: {
        executedAt: 'desc',
      },
    });

    return results;
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

  /**
   * Add test case to a module
   */
  async addTestCaseToModule(
    projectId: string,
    tcId: string,
    moduleId: string
  ) {
    // Verify test case exists and belongs to project
    const testCase = await prisma.testCase.findFirst({
      where: {
        tcId: tcId,
        projectId,
      },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    // Verify module exists and belongs to project
    const mod = await prisma.module.findFirst({
      where: {
        id: moduleId,
        projectId,
      },
    });

    if (!mod) {
      throw new Error('Module not found');
    }

    // Update test case with module
    const updatedTestCase = await prisma.testCase.update({
      where: { id: testCase.id },
      data: {
        moduleId,
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
        module: {
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
        _count: {
          select: {
            steps: true,
            results: true,
            requirements: true,
          },
        },
      },
    });

    return updatedTestCase;
  }

  /**
   * Remove test case from its module
   */
  async removeTestCaseFromModule(
    projectId: string,
    tcId: string
  ) {
    // Verify test case exists and belongs to project
    const testCase = await prisma.testCase.findFirst({
      where: {
        tcId: tcId,
        projectId,
      },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    // Update test case to remove module
    const updatedTestCase = await prisma.testCase.update({
      where: { id: testCase.id },
      data: {
        moduleId: null,
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
        module: {
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
        _count: {
          select: {
            steps: true,
            results: true,
            requirements: true,
          },
        },
      },
    });

    return updatedTestCase;
  }

  /**
   * Get defects linked to a test case
   */
  async getTestCaseDefects(testCaseId: string) {
    // Verify test case exists
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    // Get linked defects
    const testCaseDefects = await prisma.testCaseDefect.findMany({
      where: { testCaseId },
      include: {
        defect: {
          select: {
            id: true,
            defectId: true,
            title: true,
            severity: true,
            priority: true,
            status: true,
          },
        },
      },
    });

    return testCaseDefects.map((tcd) => tcd.defect);
  }

  /**
   * Link defects to a test case
   */
  async linkDefectsToTestCase(testCaseId: string, body: unknown) {
    // Validate input
    if (!body || typeof body !== 'object') {
      throw new Error('Invalid request body');
    }

    const { defectIds } = body as { defectIds?: string[] };

    if (!defectIds || !Array.isArray(defectIds) || defectIds.length === 0) {
      throw new Error('defectIds array is required');
    }

    // Verify test case exists
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    // Create TestCaseDefect links
    const links = await prisma.testCaseDefect.createMany({
      data: defectIds.map((defectId: string) => ({
        defectId,
        testCaseId,
      })),
      skipDuplicates: true, // Skip if already linked
    });

    return {
      message: 'Defects linked successfully',
      count: links.count,
    };
  }
}

export const testCaseService = new TestCaseService();
