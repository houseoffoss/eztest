import { prisma } from '@/lib/prisma';

export interface CreateTestPlanInput {
  projectId: string;
  name: string;
  description?: string;
  createdById: string;
  testCaseIds?: string[];
}

export interface UpdateTestPlanInput {
  name?: string;
  description?: string;
}

export interface AddTestCasesToPlanInput {
  testCaseIds: string[];
}

export class TestPlanService {
  /**
   * Get all test plans for a project
   */
  async getProjectTestPlans(projectId: string) {
    return prisma.testPlan.findMany({
      where: { projectId },
      include: {
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
            testCases: true,
            testRuns: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single test plan by ID with full details
   */
  async getTestPlanById(testPlanId: string) {
    return prisma.testPlan.findUnique({
      where: { id: testPlanId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
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
        testCases: {
          include: {
            testCase: {
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
                  },
                },
                _count: {
                  select: {
                    steps: true,
                  },
                },
              },
            },
          },
          orderBy: { order: 'asc' },
        },
        _count: {
          select: {
            testRuns: true,
          },
        },
      },
    });
  }

  /**
   * Create a new test plan
   */
  async createTestPlan(input: CreateTestPlanInput) {
    const { testCaseIds, ...planData } = input;

    return prisma.testPlan.create({
      data: {
        ...planData,
        testCases: testCaseIds
          ? {
              create: testCaseIds.map((testCaseId, index) => ({
                testCaseId,
                order: index,
              })),
            }
          : undefined,
      },
      include: {
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
            testCases: true,
            testRuns: true,
          },
        },
      },
    });
  }

  /**
   * Update a test plan
   */
  async updateTestPlan(testPlanId: string, input: UpdateTestPlanInput) {
    return prisma.testPlan.update({
      where: { id: testPlanId },
      data: input,
      include: {
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
            testCases: true,
            testRuns: true,
          },
        },
      },
    });
  }

  /**
   * Delete a test plan
   */
  async deleteTestPlan(testPlanId: string) {
    // Check if test plan has test runs
    const testPlan = await prisma.testPlan.findUnique({
      where: { id: testPlanId },
      include: {
        _count: {
          select: {
            testRuns: true,
          },
        },
      },
    });

    if (testPlan && testPlan._count.testRuns > 0) {
      throw new Error(
        `Cannot delete test plan with ${testPlan._count.testRuns} test run(s). Please delete or unlink test runs first.`
      );
    }

    return prisma.testPlan.delete({
      where: { id: testPlanId },
    });
  }

  /**
   * Add test cases to a test plan
   */
  async addTestCasesToPlan(testPlanId: string, testCaseIds: string[]) {
    // Get the current maximum order
    const maxOrder = await prisma.testPlanCase.findFirst({
      where: { testPlanId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const startOrder = (maxOrder?.order ?? -1) + 1;

    return prisma.testPlanCase.createMany({
      data: testCaseIds.map((testCaseId, index) => ({
        testPlanId,
        testCaseId,
        order: startOrder + index,
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Remove test cases from a test plan
   */
  async removeTestCasesFromPlan(testPlanId: string, testCaseIds: string[]) {
    return prisma.testPlanCase.deleteMany({
      where: {
        testPlanId,
        testCaseId: { in: testCaseIds },
      },
    });
  }

  /**
   * Reorder test cases in a test plan
   */
  async reorderTestCases(
    testPlanId: string,
    updates: { testCaseId: string; order: number }[]
  ) {
    return prisma.$transaction(
      updates.map((update) =>
        prisma.testPlanCase.updateMany({
          where: {
            testPlanId,
            testCaseId: update.testCaseId,
          },
          data: { order: update.order },
        })
      )
    );
  }

  /**
   * Check if user has access to a test plan
   */
  async hasAccessToTestPlan(testPlanId: string, userId: string) {
    const testPlan = await prisma.testPlan.findUnique({
      where: { id: testPlanId },
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

    if (!testPlan) return false;

    // Check if user is a project member
    return testPlan.project.members.length > 0;
  }

  /**
   * Check if user can manage a test plan
   */
  async canManageTestPlan(testPlanId: string, userId: string) {
    const testPlan = await prisma.testPlan.findUnique({
      where: { id: testPlanId },
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

    if (!testPlan) return false;

    const membership = testPlan.project.members[0];
    // Check if user is a member of the project (role-based permissions handled by hasPermission)
    return !!membership;
  }
}
