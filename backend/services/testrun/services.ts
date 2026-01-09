import { prisma } from '@/lib/prisma';

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
  status?: string;
  assignedToId?: string;
  environment?: string;
  startedAt?: Date;
  completedAt?: Date;
}

interface TestRunFilters {
  status?: string;
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
          status: 'SKIPPED',
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
      status: string;
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

  /**
   * Get recipients for test run report
   * Returns system admins, project managers, and defect assignees
   */
  async getTestRunReportRecipients(testRunId: string): Promise<{
    recipientIds: string[];
    systemAdminCount: number;
    projectManagerCount: number;
    defectAssigneeCount: number;
  }> {
    // Fetch test run with related data
    const testRun = await prisma.testRun.findUnique({
      where: { id: testRunId },
      include: {
        project: {
          include: {
            members: {
              include: {
                user: {
                  include: {
                    role: true,
                  },
                },
              },
            },
          },
        },
        results: {
          include: {
            testCase: {
              include: {
                defects: {
                  include: {
                    defect: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!testRun) {
      throw new Error('Test run not found');
    }

    const recipientSet = new Set<string>();
    let systemAdminCount = 0;
    let projectManagerCount = 0;
    let defectAssigneeCount = 0;

    // 1. Add all SYSTEM ADMIN users (global, not just project members)
    const systemAdmins = await prisma.user.findMany({
      where: {
        role: {
          name: 'ADMIN',
        },
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    systemAdmins.forEach((admin) => {
      recipientSet.add(admin.id);
      systemAdminCount++;
    });

    // 2. Add all PROJECT_MANAGER users (from project members)
    testRun.project?.members?.forEach((member) => {
      if (member.user.role?.name === 'PROJECT_MANAGER') {
        if (!recipientSet.has(member.user.id)) {
          projectManagerCount++;
        }
        recipientSet.add(member.user.id);
      }
    });

    // 3. Add all defect assignees (from test results with failed/blocked tests)
    const defectAssignees = new Set<string>();
    testRun.results?.forEach((result) => {
      if (result.status === 'FAILED' || result.status === 'BLOCKED') {
        result.testCase?.defects?.forEach((linkedDefect) => {
          if (linkedDefect.defect.assignedToId) {
            defectAssignees.add(linkedDefect.defect.assignedToId);
          }
        });
      }
    });

    defectAssignees.forEach((assigneeId) => {
      if (!recipientSet.has(assigneeId)) {
        defectAssigneeCount++;
      }
      recipientSet.add(assigneeId);
    });

    return {
      recipientIds: Array.from(recipientSet),
      systemAdminCount,
      projectManagerCount,
      defectAssigneeCount,
    };
  }

  /**
   * Send test run report to all recipients with validation
   */
  async sendTestRunReport(
    testRunId: string,
    userId: string,
    appUrl: string
  ) {
    const { emailService } = await import('@/backend/services/email/services');
    const { isEmailServiceAvailable } = await import('@/lib/email-service');
    
    // Check if SMTP is enabled
    const smtpEnabled = await isEmailServiceAvailable();
    if (!smtpEnabled) {
      console.log('[TEST RUN] SMTP disabled - skipping report email');
      return {
        success: true,
        message: 'Email service is not configured. Report not sent.',
        recipientCount: 0,
        totalRecipients: 0,
        failedRecipients: [],
        recipientDetails: [],
        smtpDisabled: true,
      };
    }
    
    // Get all recipients
    const { recipientIds } = await this.getTestRunReportRecipients(testRunId);

    if (recipientIds.length === 0) {
      // Return result instead of throwing error - show alert but don't block
      return {
        success: false,
        message: 'No recipients found for this test run report. No email sent.',
        recipientCount: 0,
        totalRecipients: 0,
        failedRecipients: [],
        recipientDetails: [],
        invalidRecipients: [],
      };
    }

    // Fetch recipient details with validation
    const recipients = await prisma.user.findMany({
      where: {
        id: {
          in: recipientIds,
        },
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    // Validate email addresses (allows default admin email from environment)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validRecipients = recipients.filter(r => {
      if (!r.email) {
        return false;
      }
      // // Allow default admin email from environment (even if it has invalid domains like .local)
      // if (isDefaultAdminEmail(r.email)) {
      //   return true;
      // }
      if (!emailRegex.test(r.email)) {
        return false;
      }
      // Check for invalid domains like .local, .invalid, .test, .example
      const invalidDomains = ['.local', '.invalid', '.test', '.example', '.localhost'];
      const lowerEmail = r.email.toLowerCase();
      for (const domain of invalidDomains) {
        if (lowerEmail.endsWith(domain)) {
          return false;
        }
      }
      return true;
    });

    // Get invalid recipients for error reporting
    const invalidRecipients = recipients.filter(r => {
      if (!r.email) return true;
      if (!emailRegex.test(r.email)) return true;
      const invalidDomains = ['.local', '.invalid', '.test', '.example', '.localhost'];
      const lowerEmail = r.email.toLowerCase();
      for (const domain of invalidDomains) {
        if (lowerEmail.endsWith(domain)) {
          return true;
        }
      }
      return false;
    }).map(r => ({
      email: r.email || 'No email',
      name: r.name,
      role: r.role?.name || 'UNKNOWN',
    }));

    // Don't throw error if no valid recipients - return result with warning instead
    if (validRecipients.length === 0) {
      return {
        success: false,
        message: `No valid email addresses found for recipients. Invalid emails: ${invalidRecipients.map(r => r.email).join(', ')}`,
        recipientCount: 0,
        totalRecipients: recipients.length,
        failedRecipients: invalidRecipients.map(r => r.email),
        recipientDetails: invalidRecipients.map(r => ({
          email: r.email,
          role: r.role,
          status: 'invalid',
        })),
        invalidRecipients,
      };
    }

    // Send email to each recipient
    let successCount = 0;
    const failedRecipients: string[] = [];
    const recipientDetails: { email: string; role: string; status: string }[] = [];

    for (const recipient of validRecipients) {
      try {
        const sent = await emailService.sendTestRunReportEmail({
          testRunId,
          recipientId: recipient.id,
          startedByUserId: userId,
          appUrl,
        });

        if (sent) {
          successCount++;
          recipientDetails.push({
            email: recipient.email,
            role: recipient.role?.name || 'UNKNOWN',
            status: 'sent',
          });
        } else {
          failedRecipients.push(recipient.email);
          recipientDetails.push({
            email: recipient.email,
            role: recipient.role?.name || 'UNKNOWN',
            status: 'failed',
          });
        }
      } catch (error) {
        console.error(`[TEST RUN] Failed to send email to ${recipient.email}:`, error);
        failedRecipients.push(recipient.email);
        recipientDetails.push({
          email: recipient.email,
          role: recipient.role?.name || 'UNKNOWN',
          status: 'error',
        });
      }
    }

    // Build message prioritizing success, then warnings about invalid/failed emails
    let message = '';
    if (successCount > 0) {
      message = `Report sent successfully to ${successCount} recipient(s)`;
      
      // Only mention invalid emails if there are any
      if (invalidRecipients.length > 0) {
        message += `. Invalid email addresses skipped: ${invalidRecipients.map(r => r.email).join(', ')}`;
      }
      
      // Only mention failed sends if there are any
      if (failedRecipients.length > 0) {
        message += `. Failed to send to: ${failedRecipients.join(', ')}`;
      }
    } else {
      // No emails sent at all - show error
      if (invalidRecipients.length > 0) {
        message = `No valid email addresses found. Invalid emails: ${invalidRecipients.map(r => r.email).join(', ')}`;
      } else if (failedRecipients.length > 0) {
        message = `Failed to send emails to: ${failedRecipients.join(', ')}`;
      } else {
        message = 'No emails were sent.';
      }
    }

    return {
      success: successCount > 0,
      message,
      recipientCount: successCount,
      totalRecipients: validRecipients.length,
      failedRecipients,
      recipientDetails,
      invalidRecipients: invalidRecipients.length > 0 ? invalidRecipients : [],
    };
  }
}

export const testRunService = new TestRunService();
