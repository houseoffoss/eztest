import { prisma } from '@/lib/prisma';
import { TestRunStatus, TestResultStatus } from '@prisma/client';

interface CreateTestRunInput {
  projectId: string;
  name: string;
  description?: string;
  assignedToId?: string;
  environment?: string;
  testCaseIds?: string[];
  testSuiteIds?: string[];
  createdById: string;
}

interface UpdateTestRunInput {
  name?: string;
  description?: string;
  status?: TestRunStatus;
  assignedToId?: string;
  environment?: string;
  startedAt?: Date;
  completedAt?: Date;
}

interface TestRunFilters {
  status?: TestRunStatus;
  assignedToId?: string;
  environment?: string;
  search?: string;
}

export class TestRunService {
  /**
   * Get all test runs for a project with optional filters
   */
  async getProjectTestRuns(projectId: string, filters?: TestRunFilters) {
    const where: Record<string, unknown> = {
      projectId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters?.environment) {
      where.environment = filters.environment;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.testRun.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
        results: {
          select: {
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get a single test run by ID
   */
  async getTestRunById(testRunId: string) {
    return await prisma.testRun.findUnique({
      where: { id: testRunId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        results: {
          include: {
            testCase: {
              select: {
                id: true,
                title: true,
                description: true,
                priority: true,
                status: true,
              },
            },
            executedBy: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            executedAt: 'desc',
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
    });
  }

  /**
   * Create a new test run
   */
  async createTestRun(data: CreateTestRunInput) {
    // Collect test case IDs
    let testCaseIds = data.testCaseIds || [];

    // If test suite IDs are provided, fetch all test cases from those suites
    if (data.testSuiteIds && data.testSuiteIds.length > 0) {
      const suiteCases = await prisma.testCase.findMany({
        where: {
          suiteId: {
            in: data.testSuiteIds,
          },
          projectId: data.projectId,
        },
        select: {
          id: true,
        },
      });
      
      const suiteTestCaseIds = suiteCases.map(tc => tc.id);
      testCaseIds = [...new Set([...testCaseIds, ...suiteTestCaseIds])]; // Remove duplicates
    }

    // Create the test run
    const testRun = await prisma.testRun.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        assignedToId: data.assignedToId || null,
        environment: data.environment,
        status: 'PLANNED',
        createdById: data.createdById,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    // If test case IDs are provided, create placeholder results
    if (testCaseIds.length > 0) {
      await prisma.testResult.createMany({
        data: testCaseIds.map((testCaseId) => ({
          testRunId: testRun.id,
          testCaseId,
          status: 'SKIPPED' as TestResultStatus,
          executedById: data.assignedToId || '', // Will be updated when actually executed
        })),
        skipDuplicates: true,
      });
    }

    return testRun;
  }

  /**
   * Update a test run
   */
  async updateTestRun(testRunId: string, data: UpdateTestRunInput) {
    return await prisma.testRun.update({
      where: { id: testRunId },
      data,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
    });
  }

  /**
   * Delete a test run
   */
  async deleteTestRun(testRunId: string) {
    return await prisma.testRun.delete({
      where: { id: testRunId },
    });
  }

  /**
   * Start a test run
   */
  async startTestRun(testRunId: string) {
    return await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      },
    });
  }

  /**
   * Complete a test run
   */
  async completeTestRun(testRunId: string) {
    return await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  /**
   * Cancel a test run
   */
  async cancelTestRun(testRunId: string) {
    return await prisma.testRun.update({
      where: { id: testRunId },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  /**
   * Add test result to test run
   */
  async addTestResult(
    testRunId: string,
    testCaseId: string,
    data: {
      status: TestResultStatus;
      executedById: string;
      duration?: number;
      comment?: string;
      errorMessage?: string;
      stackTrace?: string;
    }
  ) {
    return await prisma.testResult.upsert({
      where: {
        testRunId_testCaseId: {
          testRunId,
          testCaseId,
        },
      },
      update: {
        status: data.status,
        executedById: data.executedById,
        duration: data.duration,
        comment: data.comment,
        errorMessage: data.errorMessage,
        stackTrace: data.stackTrace,
        executedAt: new Date(),
      },
      create: {
        testRunId,
        testCaseId,
        status: data.status,
        executedById: data.executedById,
        duration: data.duration,
        comment: data.comment,
        errorMessage: data.errorMessage,
        stackTrace: data.stackTrace,
      },
      include: {
        testCase: {
          select: {
            id: true,
            title: true,
            priority: true,
          },
        },
        executedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Get test run statistics
   */
  async getTestRunStats(testRunId: string) {
    const results = await prisma.testResult.groupBy({
      by: ['status'],
      where: {
        testRunId,
      },
      _count: {
        status: true,
      },
    });

    const stats = {
      total: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      skipped: 0,
      retest: 0,
    };

    results.forEach((result) => {
      stats.total += result._count.status;
      switch (result.status) {
        case 'PASSED':
          stats.passed = result._count.status;
          break;
        case 'FAILED':
          stats.failed = result._count.status;
          break;
        case 'BLOCKED':
          stats.blocked = result._count.status;
          break;
        case 'SKIPPED':
          stats.skipped = result._count.status;
          break;
        case 'RETEST':
          stats.retest = result._count.status;
          break;
      }
    });

    return stats;
  }

  /**
   * Check if user has access to test run's project
   */
  async hasAccessToTestRun(
    testRunId: string,
    userId: string
  ): Promise<boolean> {
    const testRun = await prisma.testRun.findUnique({
      where: { id: testRunId },
      select: {
        projectId: true,
      },
    });

    if (!testRun) {
      return false;
    }

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: testRun.projectId,
          userId,
        },
      },
    });

    return !!member;
  }

  /**
   * Check if user can manage test run
   * Role-based permissions are handled by hasPermission wrapper
   */
  async canManageTestRun(
    testRunId: string,
    userId: string
  ): Promise<boolean> {
    const testRun = await prisma.testRun.findUnique({
      where: { id: testRunId },
      select: {
        projectId: true,
      },
    });

    if (!testRun) {
      return false;
    }

    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: testRun.projectId,
          userId,
        },
      },
    });

    // Check if user is a member of the project (role-based permissions handled by hasPermission)
    return !!member;
  }
}

export const testRunService = new TestRunService();
