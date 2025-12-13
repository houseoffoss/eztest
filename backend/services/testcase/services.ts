import { prisma } from '@/lib/prisma';
import { Priority, TestStatus } from '@prisma/client';
import { CustomRequest } from '@/backend/utils/interceptor';

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
      ]).then(([{ s3Client, S3_BUCKET }, { DeleteObjectCommand }]) => {
        Promise.all(
          attachments.map(attachment =>
            s3Client.send(
              new DeleteObjectCommand({
                Bucket: S3_BUCKET,
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

    // Get existing steps
    const existingSteps = await prisma.testStep.findMany({
      where: { testCaseId },
    });

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
  async associateAttachments(testCaseId: string, req: CustomRequest) {
    // Verify test case exists
    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
    });

    if (!testCase) {
      throw new Error('Test case not found');
    }

    const body = await req.json();
    const { attachments } = body as {
      attachments: Array<{ id?: string; s3Key: string; fileName: string; mimeType: string; fieldName?: string }>;
    };

    if (!attachments || !Array.isArray(attachments)) {
      throw new Error('attachments array is required');
    }

    // Link existing attachments or create new ones
    const linkedAttachments = await Promise.all(
      attachments.map(async (att) => {
        // If attachment ID is provided, update the existing record
        if (att.id) {
          return prisma.attachment.update({
            where: { id: att.id },
            data: {
              testCaseId: testCaseId,
              fieldName: att.fieldName || 'attachment',
            },
          });
        }
        
        // Otherwise, create a new attachment record (legacy/fallback)
        return (prisma.attachment.create as unknown as (args: unknown) => Promise<unknown>)({
          data: {
            filename: att.s3Key.split('/').pop() || att.fileName,
            originalName: att.fileName,
            mimeType: att.mimeType,
            size: 0,
            path: att.s3Key,
            ...(att.fieldName && { fieldName: att.fieldName }),
            testCaseId: testCaseId,
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
      ]).then(([{ s3Client, S3_BUCKET }, { DeleteObjectCommand }]) => {
        s3Client.send(
          new DeleteObjectCommand({
            Bucket: S3_BUCKET,
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
