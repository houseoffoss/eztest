import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export type ExportType = 'testcases' | 'defects' | 'testruns';

export interface ExportOptions {
  type: ExportType;
  format: 'csv' | 'excel';
  projectId: string;
  filters?: {
    // Test case filters
    moduleId?: string;
    suiteId?: string;
    status?: string;
    priority?: string;
    // Defect filters
    severity?: string;
    assignedToId?: string;
    environment?: string;
  };
}

export class ExportService {
  /**
   * Export data to CSV or Excel based on type
   */
  async exportData(options: ExportOptions): Promise<Buffer> {
    switch (options.type) {
      case 'testcases':
        return this.exportTestCases(options);
      case 'defects':
        return this.exportDefects(options);
      case 'testruns':
        return this.exportTestRuns(options);
      default:
        throw new Error(`Unsupported export type: ${options.type}`);
    }
  }

  /**
   * Export test cases to CSV or Excel
   */
  private async exportTestCases(options: ExportOptions): Promise<Buffer> {
    const { format, projectId, filters = {} } = options;

    // Build query conditions
    const where: {
      projectId: string;
      moduleId?: string;
      status?: string;
      priority?: string;
      testCaseSuites?: {
        some: {
          testSuiteId: string;
        };
      };
    } = {
      projectId,
    };

    if (filters.moduleId) {
      where.moduleId = filters.moduleId;
    }

    if (filters.suiteId) {
      where.testCaseSuites = {
        some: {
          testSuiteId: filters.suiteId,
        },
      };
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    // Fetch test cases with related data
    const testCases = await prisma.testCase.findMany({
      where,
      select: {
        id: true,
        tcId: true,
        title: true,
        description: true,
        expectedResult: true,
        priority: true,
        status: true,
        estimatedTime: true,
        preconditions: true,
        postconditions: true,
        testData: true,
        module: {
          select: {
            name: true,
          },
        },
        testCaseSuites: {
          include: {
            testSuite: {
              select: {
                name: true,
              },
            },
          },
        },
        steps: {
          orderBy: {
            stepNumber: 'asc',
          },
          select: {
            stepNumber: true,
            action: true,
            expectedResult: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        tcId: 'asc',
      },
    });

    // Fetch all linked defects for test cases in one query
    const testCaseIds = testCases.map((tc) => tc.id);
    const allTestCaseDefects = await prisma.testCaseDefect.findMany({
      where: { testCaseId: { in: testCaseIds } },
      include: { defect: { select: { defectId: true } } },
    });
    const defectsByTestCaseId = new Map<string, string[]>();
    allTestCaseDefects.forEach((td) => {
      const existing = defectsByTestCaseId.get(td.testCaseId) || [];
      existing.push(td.defect.defectId);
      defectsByTestCaseId.set(td.testCaseId, existing);
    });

    // Transform data for export
    const exportData = testCases.map((tc) => {
      const suites = tc.testCaseSuites.map((tcs) => tcs.testSuite.name).join('; ');

      // Format test steps as JSON array (matching import format)
      const testStepsArray = tc.steps.map((step) => ({
        stepNumber: step.stepNumber,
        action: step.action,
        expectedResult: step.expectedResult || '',
      }));
      const testStepsJson = JSON.stringify(testStepsArray);

      // Get test data (from testData field if available)
      const testData = tc.testData || '';

      // Get linked defect IDs from pre-fetched map
      const linkedDefectIds = defectsByTestCaseId.get(tc.id) || [];
      const defectIds = linkedDefectIds.join(', ');

      return {
        'Test Case ID': tc.tcId,
        'Test Case Title': tc.title,
        'Module / Feature': tc.module?.name || '',
        'Priority': tc.priority,
        'Preconditions': tc.preconditions || '',
        'Test Steps': testStepsJson,
        'Test Data': testData,
        'Expected Result': tc.expectedResult || '',
        'Status': tc.status,
        'Defect ID': defectIds,
        // Older fields (for backward compatibility)
        'Description': tc.description || '',
        'Estimated Time (minutes)': tc.estimatedTime || '',
        'Postconditions': tc.postconditions || '',
        'Test Suites': suites,
      };
    });

    if (format === 'csv') {
      return this.generateCSV(exportData);
    } else {
      return this.generateExcel(exportData, 'Test Cases');
    }
  }

  /**
   * Export defects to CSV or Excel
   */
  private async exportDefects(options: ExportOptions): Promise<Buffer> {
    const { format, projectId, filters = {} } = options;

    // Build query conditions
    const where: {
      projectId: string;
      status?: string;
      severity?: string;
      priority?: string;
      assignedToId?: string;
      environment?: string;
    } = {
      projectId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.severity) {
      where.severity = filters.severity;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.environment) {
      where.environment = filters.environment;
    }

    // Fetch defects with related data
    const defects = await prisma.defect.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        testRun: {
          select: {
            name: true,
          },
        },
        testCases: {
          include: {
            testCase: {
              select: {
                tcId: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        defectId: 'asc',
      },
    });

    // Transform data for export
    const exportData = defects.map((defect) => {
      return {
        'Defect Title / Summary': defect.title,
        'Description': defect.description || '',
        'Severity': defect.severity,
        'Priority': defect.priority,
        'Status': defect.status,
        'Environment': defect.environment || '',
        'Reported By': defect.createdBy.name || defect.createdBy.email,
        'Reported Date': defect.createdAt.toISOString().split('T')[0],
        'Assigned To': defect.assignedTo?.name || defect.assignedTo?.email || '',
        'Due Date': defect.dueDate ? defect.dueDate.toISOString().split('T')[0] : '',
        'Progress (%)': defect.progressPercentage ?? 0,
        'Closed At': defect.closedAt ? defect.closedAt.toISOString().split('T')[0] : '',
        'Updated At': defect.updatedAt.toISOString().split('T')[0],
      };
    });

    if (format === 'csv') {
      return this.generateCSV(exportData);
    } else {
      return this.generateExcel(exportData, 'Defects');
    }
  }

  /**
   * Export test runs to CSV or Excel
   */
  private async exportTestRuns(options: ExportOptions): Promise<Buffer> {
    const { format, projectId, filters = {} } = options;

    // Build query conditions
    const where: {
      projectId: string;
      status?: string;
      environment?: string;
      assignedToId?: string;
    } = {
      projectId,
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.environment) {
      where.environment = filters.environment;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    // Fetch test runs with related data
    const testRuns = await prisma.testRun.findMany({
      where,
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        suites: {
          include: {
            testSuite: {
              select: {
                name: true,
              },
            },
          },
        },
        results: {
          include: {
            testCase: {
              select: {
                tcId: true,
                title: true,
              },
            },
            executedBy: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data for export
    const exportData = testRuns.map((testRun) => {
      const suites = testRun.suites.map((trs) => trs.testSuite.name).join('; ');
      
      // Calculate statistics
      const totalResults = testRun.results.length;
      const passed = testRun.results.filter((r) => r.status === 'PASSED').length;
      const failed = testRun.results.filter((r) => r.status === 'FAILED').length;
      const blocked = testRun.results.filter((r) => r.status === 'BLOCKED').length;
      const skipped = testRun.results.filter((r) => r.status === 'SKIPPED').length;
      const retest = testRun.results.filter((r) => r.status === 'RETEST').length;

      return {
        'Test Run Name': testRun.name,
        'Description': testRun.description || '',
        'Status': testRun.status,
        'Environment': testRun.environment || '',
        'Assigned To': testRun.assignedTo?.name || testRun.assignedTo?.email || '',
        'Test Suites': suites,
        'Total Results': totalResults,
        'Passed': passed,
        'Failed': failed,
        'Blocked': blocked,
        'Skipped': skipped,
        'Retest': retest,
        'Started At': testRun.startedAt ? testRun.startedAt.toISOString() : '',
        'Completed At': testRun.completedAt ? testRun.completedAt.toISOString() : '',
        'Created By': testRun.createdBy.name || testRun.createdBy.email,
        'Created At': testRun.createdAt.toISOString(),
        'Updated At': testRun.updatedAt.toISOString(),
      };
    });

    if (format === 'csv') {
      return this.generateCSV(exportData);
    } else {
      return this.generateExcel(exportData, 'Test Runs');
    }
  }

  /**
   * Export a single test run with detailed report including test cases and defects
   */
  async exportTestRunDetail(testRunId: string, format: 'csv' | 'excel'): Promise<Buffer> {
    // Fetch test run with all related data
    const testRun = await prisma.testRun.findUnique({
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
            name: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
        suites: {
          include: {
            testSuite: {
              select: {
                name: true,
              },
            },
          },
        },
        results: {
          include: {
            testCase: {
              select: {
                id: true,
                tcId: true,
                title: true,
                description: true,
                priority: true,
                status: true,
                module: {
                  select: {
                    name: true,
                  },
                },
              },
            },
            executedBy: {
              select: {
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            executedAt: 'desc',
          },
        },
        defects: {
          include: {
            assignedTo: {
              select: {
                name: true,
                email: true,
              },
            },
            createdBy: {
              select: {
                name: true,
                email: true,
              },
            },
            testCases: {
              include: {
                testCase: {
                  select: {
                    id: true,
                    tcId: true,
                    title: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!testRun) {
      throw new Error('Test run not found');
    }

    const suites = testRun.suites.map((trs) => trs.testSuite.name).join('; ');
    
    // Calculate statistics
    const totalResults = testRun.results.length;
    const passed = testRun.results.filter((r) => r.status === 'PASSED').length;
    const failed = testRun.results.filter((r) => r.status === 'FAILED').length;
    const blocked = testRun.results.filter((r) => r.status === 'BLOCKED').length;
    const skipped = testRun.results.filter((r) => r.status === 'SKIPPED').length;
    const retest = testRun.results.filter((r) => r.status === 'RETEST').length;
    
    // Calculate percentages
    const passRate = totalResults > 0 ? Math.round((passed / totalResults) * 100) : 0;
    const failRate = totalResults > 0 ? Math.round((failed / totalResults) * 100) : 0;
    const blockedRate = totalResults > 0 ? Math.round((blocked / totalResults) * 100) : 0;
    const skippedRate = totalResults > 0 ? Math.round((skipped / totalResults) * 100) : 0;
    const retestRate = totalResults > 0 ? Math.round((retest / totalResults) * 100) : 0;
    
    // Calculate total duration
    const totalDuration = testRun.results.reduce((sum, r) => sum + (r.duration || 0), 0);
    const totalDurationMinutes = Math.round(totalDuration / 60);

    // Transform data for export - only summary with counts
    const exportData: Record<string, string | number>[] = [];
    
    // Add summary row with overall statistics
    exportData.push({
      'Test Run Name': testRun.name,
      'Test Run Description': testRun.description || '',
      'Test Run Status': testRun.status,
      'Project': testRun.project.name,
      'Project Key': testRun.project.key,
      'Environment': testRun.environment || '',
      'Assigned To': testRun.assignedTo?.name || testRun.assignedTo?.email || '',
      'Test Suites': suites,
      'Total Results': totalResults,
      'Passed': passed,
      'Failed': failed,
      'Blocked': blocked,
      'Skipped': skipped,
      'Retest': retest,
      'Total Defects': testRun.defects.length,
      'Pass Rate (%)': passRate,
      'Fail Rate (%)': failRate,
      'Blocked Rate (%)': blockedRate,
      'Skipped Rate (%)': skippedRate,
      'Retest Rate (%)': retestRate,
      'Total Duration (seconds)': totalDuration,
      'Total Duration (minutes)': totalDurationMinutes,
      'Started At': testRun.startedAt ? testRun.startedAt.toISOString() : '',
      'Completed At': testRun.completedAt ? testRun.completedAt.toISOString() : '',
      'Created By': testRun.createdBy.name || testRun.createdBy.email,
      'Created At': testRun.createdAt.toISOString(),
      'Updated At': testRun.updatedAt.toISOString(),
    });

    if (format === 'csv') {
      return this.generateCSV(exportData);
    } else {
      return this.generateExcel(exportData, 'Test Run Report');
    }
  }

  /**
   * Generate CSV buffer
   */
  private generateCSV(data: Record<string, string | number>[]): Buffer {
    const csv = Papa.unparse(data, {
      header: true,
    });
    return Buffer.from(csv, 'utf-8');
  }

  /**
   * Generate Excel buffer
   */
  private generateExcel(data: Record<string, string | number>[], sheetName: string): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate buffer - XLSX.write with type: 'buffer' returns a Buffer directly
    const excelBuffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
      compression: true,
    });
    
    // Ensure it's a proper Buffer instance
    return Buffer.isBuffer(excelBuffer) ? excelBuffer : Buffer.from(excelBuffer);
  }
}

export const exportService = new ExportService();

