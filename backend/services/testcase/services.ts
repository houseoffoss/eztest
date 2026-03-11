import { prisma } from '@/lib/prisma';

/**
 * TestCase 一覧取得用の select（platform, device 等が DB にない環境用）
 * これらの列がある環境では通常の include が使われる
 */
const TEST_CASE_LIST_SELECT = {
  id: true,
  tcId: true,
  projectId: true,
  moduleId: true,
  suiteId: true,
  title: true,
  description: true,
  expectedResult: true,
  priority: true,
  status: true,
  estimatedTime: true,
  preconditions: true,
  postconditions: true,
  testData: true,
  pendingDefectIds: true,
  rtcId: true,
  flowId: true,
  layer: true,
  testType: true,
  evidence: true,
  notes: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
  module: { select: { id: true, name: true, updatedAt: true } },
  suite: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true, email: true, avatar: true } },
  _count: {
    select: {
      steps: true,
      results: true,
      requirements: true,
      defects: {
        where: {
          defect: {
            status: { not: 'CLOSED' },
          },
        },
      },
    },
  },
} as const;

interface CreateTestCaseInput {
  projectId: string;
  moduleId?: string;
  suiteId?: string;
  title: string;
  description?: string;
  expectedResult?: string;
  testData?: string;
  priority?: string;
  status?: string;
  estimatedTime?: number;
  preconditions?: string;
  postconditions?: string;
  createdById: string;
  steps?: Array<{
    stepNumber: number;
    action: string;
    expectedResult: string;
  }>;
  // New fields
  rtcId?: string | null;
  flowId?: string | null;
  layer?: 'SMOKE' | 'CORE' | 'EXTENDED' | 'UNKNOWN' | null;
  testType?: string | null;
  evidence?: string | null;
  notes?: string | null;
  platform?: 'Web' | 'Web(SP)' | 'iOS Native' | 'Android Native' | null;
  device?: 'iPhone' | 'Android' | 'PC' | null;
  domain?: string | null;
  functionName?: string | null;
  executionType?: '手動' | '自動' | null;
  automationStatus?: '自動化済' | '自動化対象' | '自動化対象外' | '検討中' | null;
}

interface UpdateTestCaseInput {
  title?: string;
  description?: string;
  expectedResult?: string;
  testData?: string;
  priority?: string;
  status?: string;
  estimatedTime?: number;
  preconditions?: string;
  postconditions?: string;
  moduleId?: string | null;
  suiteId?: string | null;
  // New fields
  rtcId?: string | null;
  flowId?: string | null;
  layer?: 'SMOKE' | 'CORE' | 'EXTENDED' | 'UNKNOWN' | null;
  testType?: string | null;
  evidence?: string | null;
  notes?: string | null;
  platform?: 'Web' | 'Web(SP)' | 'iOS Native' | 'Android Native' | null;
  device?: 'iPhone' | 'Android' | 'PC' | null;
  domain?: string | null;
  functionName?: string | null;
  executionType?: '手動' | '自動' | null;
  automationStatus?: '自動化済' | '自動化対象' | '自動化対象外' | '検討中' | null;
}

interface TestCaseFilters {
  suiteId?: string;
  priority?: string;
  status?: string;
  search?: string;
  domain?: string;
  functionName?: string;
}

export class TestCaseService {
  /**
   * Generate next test case ID for a project (e.g., TC-1, TC-2, TC-3...)
   */
  private async generateTestCaseId(projectId: string): Promise<string> {
    // Get existing test cases to find the highest number
    const existingTestCases = await prisma.testCase.findMany({
      where: { projectId },
      select: { tcId: true },
      orderBy: { tcId: 'desc' },
    });

    let nextTestCaseNumber = 1;
    if (existingTestCases.length > 0) {
      // Extract number from existing TC-XXX format
      const lastTcId = existingTestCases[0].tcId;
      const match = lastTcId.match(/\d+/);
      if (match) {
        nextTestCaseNumber = parseInt(match[0], 10) + 1;
      }
    }
    
    // Generate ID in TC-XXX format without padding (TC-1, TC-2, etc.)
    let tcId = `TC-${nextTestCaseNumber}`;
    
    // Check if this ID already exists
    let exists = await prisma.testCase.findFirst({
      where: {
        projectId,
        tcId,
      },
    });
    
    // If exists, keep incrementing until we find an available ID
    while (exists) {
      nextTestCaseNumber++;
      tcId = `TC-${nextTestCaseNumber}`;
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
      select: TEST_CASE_LIST_SELECT,
      orderBy: [
        { module: { name: 'asc' } },  // Module name ascending (SM_008, SM_009...)
        { flowId: 'asc' }  // Then Flow-ID ascending
      ],
    });
  }

  /**
   * Get project test cases with pagination and module grouping
   */
  async getProjectTestCasesWithPagination(
    projectId: string,
    filters?: TestCaseFilters & { moduleId?: string },
    paginationOptions: { page: number; limit: number; groupBy: string } = { page: 1, limit: 10, groupBy: 'module' }
  ) {
    const { page, limit, groupBy } = paginationOptions;
    
    // Build filter conditions
    const where: Record<string, unknown> = { projectId };
    
    if (filters?.suiteId) {
      where.suiteId = filters.suiteId;
    }
    
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.moduleId) {
      where.moduleId = filters.moduleId;
    }
    
    if (filters?.domain) {
      where.domain = filters.domain;
    }
    
    if (filters?.functionName) {
      where.functionName = filters.functionName;
    }
    
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    // Get total count for pagination metadata
    const totalItems = await prisma.testCase.count({ where });

    // Fetch all modules for the project (needed for empty module display)
    const modules = await prisma.module.findMany({
      where: { projectId },
      include: {
        _count: {
          select: { testCases: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    if (groupBy === 'module') {
      // Module-based pagination with proper handling of large modules
      // Strategy: Flatten test cases while maintaining module order, then paginate
      
      // Get all test cases for grouping, sorted by module name then flowId
      const allTestCases = await prisma.testCase.findMany({
        where,
        select: TEST_CASE_LIST_SELECT,
        orderBy: [
          { module: { name: 'asc' } },  // Module name ascending (SM_008, SM_009...)
          { flowId: 'asc' }  // Then Flow-ID ascending
        ]
      });

      // Group test cases by module
      const grouped: Record<string, typeof allTestCases> = {};
      
      allTestCases.forEach(tc => {
        const moduleId = tc.moduleId || 'no-module';
        if (!grouped[moduleId]) {
          grouped[moduleId] = [];
        }
        grouped[moduleId].push(tc);
      });

      // Create list of all groups (modules + ungrouped) preserving module order
      interface GroupInfo {
        id: string;
        testCases: typeof allTestCases;
        isEmpty: boolean;
      }

      const allGroups: GroupInfo[] = [];

      // Add all module groups (including empty modules) in the order from modules array
      // modules array is already sorted by order: 'asc', so we preserve that order
      modules.forEach(module => {
        const hasTestCases = grouped[module.id] && grouped[module.id].length > 0;
        
        allGroups.push({
          id: module.id,
          testCases: hasTestCases ? grouped[module.id] : [],
          isEmpty: !hasTestCases
        });
      });

      // Add ungrouped test cases as a group at the end
      if (grouped['no-module'] && grouped['no-module'].length > 0) {
        allGroups.push({
          id: 'no-module',
          testCases: grouped['no-module'],
          isEmpty: false
        });
      }

      // No additional sorting needed - modules are already in correct order from the modules array

      // Flatten all test cases in sorted group order
      const orderedTestCases: typeof allTestCases = [];
      
      allGroups.forEach(group => {
        // Only add test cases from groups that have them (skip empty modules)
        if (group.testCases.length > 0) {
          // Test cases are already sorted by module order and flowId from the query above
          orderedTestCases.push(...group.testCases);
        }
      });

      // Get empty modules (preserve order from modules array)
      const emptyModules = allGroups.filter(g => g.isEmpty);

      // Calculate pagination including empty modules as "phantom items" on the last page
      const emptyModuleCount = emptyModules.length;
      const totalItemsWithEmptyModules = totalItems + emptyModuleCount;
      const totalPages = Math.ceil(totalItemsWithEmptyModules / limit) || 1;
      
      // Apply pagination on the ordered list
      const skip = (page - 1) * limit;
      let testCases = orderedTestCases.slice(skip, skip + limit);
      
      // If this is the last page and we have space, we need to account for empty modules
      const isLastPage = page === totalPages;
      if (isLastPage && emptyModuleCount > 0) {
        // On the last page, ensure we have the correct slice considering empty modules
        // The empty modules take up "space" at the end of the pagination
        const remainingTestCases = orderedTestCases.length - skip;
        if (remainingTestCases < limit) {
          // We're on the last page with test cases
          testCases = orderedTestCases.slice(skip);
        }
      }

      return {
        testCases,
        modules,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: totalItemsWithEmptyModules, // Include empty modules in total count
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        }
      };
    } else {
      // Simple pagination (no grouping) - sorted by module name then flowId
      const skip = (page - 1) * limit;
      
      const testCases = await prisma.testCase.findMany({
        where,
        skip,
        take: limit,
        select: TEST_CASE_LIST_SELECT,
        orderBy: [
          { module: { name: 'asc' } },  // Module name ascending (SM_008, SM_009...)
          { flowId: 'asc' }  // Then Flow-ID ascending
        ]
      });

      const totalPages = Math.ceil(totalItems / limit) || 1;

      return {
        testCases,
        modules,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        }
      };
    }
  }

  /**
   * Get distinct domain and functionName values for a project (for filter dropdowns)
   */
  async getTestCaseFilterOptions(projectId: string): Promise<{ domains: string[]; functionNames: string[] }> {
    try {
      const [domainRows, functionNameRows] = await Promise.all([
        prisma.testCase.findMany({
          where: { projectId, domain: { not: null } },
          select: { domain: true },
          distinct: ['domain'],
        }),
        prisma.testCase.findMany({
          where: { projectId, functionName: { not: null } },
          select: { functionName: true },
          distinct: ['functionName'],
        }),
      ]);
      const domains = domainRows.map(r => r.domain).filter((s): s is string => s != null && s.trim() !== '').sort();
      const functionNames = functionNameRows.map(r => r.functionName).filter((s): s is string => s != null && s.trim() !== '').sort();
      return { domains, functionNames };
    } catch {
      // domain/functionName 列が DB にない環境では空配列を返す
      return { domains: [], functionNames: [] };
    }
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
            testData: data.testData,
            priority: data.priority || 'MEDIUM',
            status: data.status || 'DRAFT',
            estimatedTime: data.estimatedTime,
            preconditions: data.preconditions,
            postconditions: data.postconditions,
            createdById: data.createdById,
            // New fields
            rtcId: data.rtcId,
            flowId: data.flowId,
            layer: data.layer,
            testType: data.testType,
            evidence: data.evidence,
            notes: data.notes,
            platform: data.platform ?? undefined,
            device: data.device ?? undefined,
            domain: data.domain ?? undefined,
            functionName: data.functionName ?? undefined,
            executionType: data.executionType ?? undefined,
            automationStatus: data.automationStatus ?? undefined,
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
    if (data.testData !== undefined) updateData.testData = data.testData;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.estimatedTime !== undefined) updateData.estimatedTime = data.estimatedTime;
    if (data.preconditions !== undefined) updateData.preconditions = data.preconditions;
    if (data.postconditions !== undefined) updateData.postconditions = data.postconditions;
    if (data.suiteId !== undefined) updateData.suiteId = data.suiteId;
    if (data.moduleId !== undefined) updateData.moduleId = data.moduleId;
    // New fields
    if (data.rtcId !== undefined) updateData.rtcId = data.rtcId;
    if (data.flowId !== undefined) updateData.flowId = data.flowId;
    if (data.layer !== undefined) updateData.layer = data.layer;
    if (data.testType !== undefined) updateData.testType = data.testType;
    if (data.evidence !== undefined) updateData.evidence = data.evidence;
    if (data.notes !== undefined) updateData.notes = data.notes;
    if (data.platform !== undefined) updateData.platform = data.platform;
    if (data.device !== undefined) updateData.device = data.device;
    if (data.domain !== undefined) updateData.domain = data.domain;
    if (data.functionName !== undefined) updateData.functionName = data.functionName;
    if (data.executionType !== undefined) updateData.executionType = data.executionType;
    if (data.automationStatus !== undefined) updateData.automationStatus = data.automationStatus;

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
      select: { id: true }, // 存在確認のみ。platform 等が DB にない環境でも動作するため
    });

    if (!testCase) {
      throw new Error('Test case not found or access denied');
    }

    // Fetch all attachments before deletion to clean up files
    const attachments = await prisma.attachment.findMany({
      where: {
        OR: [
          { testCaseId: testCaseId },
          {
            testStep: {
              testCaseId: testCaseId,
            },
          },
        ],
      },
    });

    // Delete test case (attachments and steps will cascade)
    const result = await prisma.testCase.delete({
      where: { id: testCaseId },
    });

    // Delete files from S3 (fire and forget)
    if (attachments.length > 0) {
      Promise.all([
        import('@/lib/s3-client'),
        import('@aws-sdk/client-s3')
      ]).then(([{ s3Client, getS3Bucket, isS3Configured }, { DeleteObjectCommand }]) => {
        if (!isS3Configured()) return;
        const bucket = getS3Bucket();
        Promise.all(
          attachments.map(attachment =>
            s3Client.send(
              new DeleteObjectCommand({
                Bucket: bucket,
                Key: attachment.path,
              })
            ).catch((error: Error) => {
              console.error(`Failed to delete S3 file ${attachment.path}:`, error);
            })
          )
        );
      });
    }

    return result;
  }

  /**
   * Bulk delete test cases in a project
   * Ensures all selected test cases are accessible within the target project
   */
  async bulkDeleteTestCases(projectId: string, testCaseIds: string[], userId: string, scope: string) {
    const uniqueTestCaseIds = Array.from(new Set(testCaseIds));

    if (uniqueTestCaseIds.length === 0) {
      return { deletedCount: 0 };
    }

    let whereClause: Record<string, unknown> = {
      id: { in: uniqueTestCaseIds },
      projectId,
    };

    if (scope === 'project') {
      whereClause = {
        ...whereClause,
        project: {
          members: {
            some: {
              userId,
            },
          },
        },
      };
    }

    const accessibleTestCases = await prisma.testCase.findMany({
      where: whereClause,
      select: { id: true },
    });

    if (accessibleTestCases.length !== uniqueTestCaseIds.length) {
      throw new Error('Some test cases not found or access denied');
    }

    await Promise.all(
      uniqueTestCaseIds.map((testCaseId) => this.deleteTestCase(testCaseId, userId, scope))
    );

    return { deletedCount: uniqueTestCaseIds.length };
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

    // Update or create steps while preserving IDs for existing steps
    if (steps.length > 0) {
      // Step 1: Delete steps that are no longer in the list FIRST to avoid unique constraint conflicts
      const stepIdsToKeep = steps
        .filter(s => s.id && !s.id.startsWith('temp-'))
        .map(s => s.id as string);
      
      if (stepIdsToKeep.length > 0) {
        await prisma.testStep.deleteMany({
          where: {
            testCaseId,
            id: {
              notIn: stepIdsToKeep,
            },
          },
        });
      } else {
        // No existing steps to keep, delete all
        await prisma.testStep.deleteMany({
          where: { testCaseId },
        });
      }

      // Step 2: Update existing steps and create new steps
      for (const step of steps) {
        if (step.id && !step.id.startsWith('temp-')) {
          // Existing step - update it
          try {
            const existingStep = await prisma.testStep.findUnique({
              where: { id: step.id },
            });
            
            if (existingStep) {
              // Step exists, update it
              await prisma.testStep.update({
                where: { id: step.id },
                data: {
                  stepNumber: step.stepNumber,
                  action: step.action,
                  expectedResult: step.expectedResult,
                },
              });
            } else {
              // Step doesn't exist, create it with the specified ID
              await prisma.testStep.create({
                data: {
                  id: step.id,
                  testCaseId,
                  stepNumber: step.stepNumber,
                  action: step.action,
                  expectedResult: step.expectedResult,
                },
              });
            }
          } catch (error) {
            throw error;
          }
        } else {
          // New step (no ID or temp ID) - create it
          await prisma.testStep.create({
            data: {
              testCaseId,
              stepNumber: step.stepNumber,
              action: step.action,
              expectedResult: step.expectedResult,
            },
          });
        }
      }
    } else {
      // No steps provided - delete all
      await prisma.testStep.deleteMany({
        where: { testCaseId },
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
    const results = await Promise.allSettled(
      defectIds.map((defectId: string) =>
        (prisma.testCaseDefect.create as unknown as (args: unknown) => Promise<unknown>)({
          data: {
            testCaseId,
            defectId,
          },
        }).catch((error: { code: string }) => {
          // Ignore if link already exists (unique constraint)
          if (error.code === 'P2002') return null;
          throw error;
        })
      )
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;

    return {
      message: 'Defects linked successfully',
      count: successCount,
    };
  }

  /**
   * Associate S3 attachments with a test case
   */
  async associateAttachments(
    testCaseId: string, 
    attachments: Array<{ id: string; fieldName?: string }>
  ) {
    // Verify test case exists
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    // Link existing attachments by updating their testCaseId
    const linkedAttachments = await Promise.all(
      attachments.map(async (att) => {
        return prisma.attachment.update({
          where: { id: att.id },
          data: {
            testCaseId: testCaseId,
            fieldName: att.fieldName || 'attachment',
          },
        });
      })
    );

    return linkedAttachments;
  }

  /**
   * Get all attachments for a test case
   */
  async getTestCaseAttachments(testCaseId: string) {
    // Verify test case exists
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    const attachments = await prisma.attachment.findMany({
      where: { testCaseId },
      orderBy: { uploadedAt: 'desc' },
    });

    return attachments;
  }

  /**
   * Delete an attachment from a test case
   */
  async deleteAttachment(testCaseId: string, attachmentId: string) {
    // Verify test case exists
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    // Verify attachment exists and belongs to this test case
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment || attachment.testCaseId !== testCaseId) {
      throw new Error('Attachment not found');
    }

    // Delete attachment record from database
    const deleted = await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    // Delete file from S3 (fire and forget to avoid blocking)
    if (attachment.path) {
      Promise.all([
        import('@/lib/s3-client'),
        import('@aws-sdk/client-s3')
      ]).then(([{ s3Client, getS3Bucket, isS3Configured }, { DeleteObjectCommand }]) => {
        if (!isS3Configured()) return;
        const bucket = getS3Bucket();
        s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: attachment.path,
          })
        ).catch((error: Error) => {
          console.error(`Failed to delete S3 file ${attachment.path}:`, error);
          // Don't throw - file is already deleted from DB
        });
      });
    }

    return deleted;
  }
}

export const testCaseService = new TestCaseService();
