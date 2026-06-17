import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export type ExportType = 'testcases' | 'defects' | 'testruns';

export interface ExportOptions {
  type: ExportType;
  format: 'csv' | 'excel' | 'pdf';
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

      // Format test steps in import format (numbered list, newline-separated)
      // Format: "1. Action 1\n2. Action 2\n..."
      const testStepsFormatted = tc.steps
        .map((step) => {
          return `${step.stepNumber}. ${step.action || ''}`;
        })
        .join('\n');

      // Format expected results in import format
      // Single result: plain string (no numbering)
      // Multiple results: numbered list, newline-separated
      const expectedResultsList: string[] = [];
      tc.steps.forEach((step) => {
        if (step.expectedResult && step.expectedResult.trim()) {
          expectedResultsList.push(step.expectedResult.trim());
        }
      });
      
      let expectedResultFormatted = '';
      if (expectedResultsList.length > 1) {
        // Multiple results: format as numbered list "1. Result 1\n2. Result 2\n..."
        expectedResultFormatted = expectedResultsList
          .map((result, index) => `${index + 1}. ${result}`)
          .join('\n');
      } else if (expectedResultsList.length === 1) {
        // Single result: export as plain string (no numbering)
        expectedResultFormatted = expectedResultsList[0];
      } else if (tc.expectedResult && tc.expectedResult.trim()) {
        // Fall back to test case level expected result if no step-level results
        expectedResultFormatted = tc.expectedResult.trim();
      }
      // If empty, expectedResultFormatted remains empty string

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
        'Test Steps': testStepsFormatted,
        'Test Data': testData,
        'Expected Result': expectedResultFormatted,
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
  async exportTestRunDetail(testRunId: string, format: 'csv' | 'excel' | 'pdf'): Promise<Buffer> {
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
    }

    if (format === 'excel') {
      return this.generateExcel(exportData, 'Test Run Report');
    }

    return this.generateTestRunPdfReport({
      testRun: {
        id: testRun.id,
        name: testRun.name,
        description: testRun.description || '',
        status: testRun.status,
        environment: testRun.environment || '',
        projectName: testRun.project.name,
        projectKey: testRun.project.key,
        assignedTo: testRun.assignedTo?.name || testRun.assignedTo?.email || '-',
        createdBy: testRun.createdBy.name || testRun.createdBy.email,
        startedAt: testRun.startedAt ? testRun.startedAt.toISOString() : '-',
        completedAt: testRun.completedAt ? testRun.completedAt.toISOString() : '-',
      },
      stats: {
        totalResults,
        passed,
        failed,
        blocked,
        skipped,
        retest,
        passRate,
        failRate,
        blockedRate,
        skippedRate,
        retestRate,
        totalDuration,
        totalDurationMinutes,
        defectsCount: testRun.defects.length,
      },
      topFailedCases: testRun.results
        .filter((r) => r.status === 'FAILED' || r.status === 'BLOCKED')
        .slice(0, 20)
        .map((r) => ({
          tcId: r.testCase.tcId,
          title: r.testCase.title,
          status: r.status,
          executedBy: r.executedBy?.name || r.executedBy?.email || '-',
          comment: r.comment || '',
        })),
      defects: testRun.defects.slice(0, 25).map((d) => ({
        defectId: d.defectId,
        title: d.title,
        status: d.status,
        severity: d.severity,
        assignedTo: d.assignedTo?.name || d.assignedTo?.email || '-',
      })),
    });
  }

  private generateTestRunPdfReport(input: {
    testRun: {
      id: string;
      name: string;
      description: string;
      status: string;
      environment: string;
      projectName: string;
      projectKey: string;
      assignedTo: string;
      createdBy: string;
      startedAt: string;
      completedAt: string;
    };
    stats: {
      totalResults: number;
      passed: number;
      failed: number;
      blocked: number;
      skipped: number;
      retest: number;
      passRate: number;
      failRate: number;
      blockedRate: number;
      skippedRate: number;
      retestRate: number;
      totalDuration: number;
      totalDurationMinutes: number;
      defectsCount: number;
    };
    topFailedCases: Array<{
      tcId: string;
      title: string;
      status: string;
      executedBy: string;
      comment: string;
    }>;
    defects: Array<{
      defectId: string;
      title: string;
      status: string;
      severity: string;
      assignedTo: string;
    }>;
  }): Buffer {
    const pageWidth = 595;
    const pageHeight = 842;
    const marginX = 40;
    const bottomMargin = 36;
    const passRateValue = input.stats.passRate;
    const hasCriticalOutcome = input.stats.failed > 0 || input.stats.blocked > 0;
    const summaryLabel = hasCriticalOutcome ? 'At Risk' : 'Healthy';
    const summaryColor: [number, number, number] = hasCriticalOutcome ? [0.86, 0.18, 0.23] : [0.13, 0.66, 0.34];
    const summaryText = hasCriticalOutcome
      ? 'Execution has unresolved failed or blocked cases. Review failed cases and linked defects first.'
      : 'Execution is stable with no failed/blocked cases. Focus on skipped/retest items if needed.';
    let y = pageHeight;

    const pageCommands: string[][] = [];
    let currentPage: string[] = [];

    const sanitize = (value: string) =>
      value
        .replace(/\\/g, '\\\\')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/[\n\r\t]+/g, ' ')
        .replace(/[\x00-\x1F\x7F]/g, '')
        .replace(/[^\x20-\x7E\xA0-\xFF]/g, '?');

    const truncate = (value: string, length: number) => {
      if (value.length <= length) {
        return value;
      }
      return `${value.slice(0, Math.max(0, length - 3))}...`;
    };

    const text = (
      value: string,
      x: number,
      yPos: number,
      options?: { size?: number; bold?: boolean; color?: [number, number, number] }
    ) => {
      const size = options?.size ?? 10;
      const font = options?.bold ? 'F2' : 'F1';
      const [r, g, b] = options?.color ?? [0.12, 0.16, 0.24];
      currentPage.push(
        `BT /${font} ${size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${x.toFixed(2)} ${yPos.toFixed(2)} Tm (${sanitize(value)}) Tj ET`
      );
    };

    const rect = (
      x: number,
      yPos: number,
      w: number,
      h: number,
      options?: {
        fill?: [number, number, number];
        stroke?: [number, number, number];
        lineWidth?: number;
      }
    ) => {
      if (options?.fill) {
        const [r, g, b] = options.fill;
        currentPage.push(`${r} ${g} ${b} rg ${x.toFixed(2)} ${yPos.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
      }
      if (options?.stroke) {
        const [r, g, b] = options.stroke;
        const lineWidth = options.lineWidth ?? 1;
        currentPage.push(
          `${lineWidth} w ${r} ${g} ${b} RG ${x.toFixed(2)} ${yPos.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`
        );
      }
    };

    const estimateCharsPerLine = (fontSize: number, maxWidth: number) => Math.max(10, Math.floor(maxWidth / (fontSize * 0.52)));

    const wrapText = (value: string, fontSize: number, maxWidth: number) => {
      const clean = value.trim().replace(/\s+/g, ' ');
      if (!clean) {
        return ['-'];
      }

      const maxChars = estimateCharsPerLine(fontSize, maxWidth);
      const words = clean.split(' ');
      const lines: string[] = [];
      let line = '';

      words.forEach((word) => {
        const next = line ? `${line} ${word}` : word;
        if (next.length <= maxChars) {
          line = next;
        } else {
          if (line) {
            lines.push(line);
          }
          if (word.length > maxChars) {
            lines.push(`${word.slice(0, Math.max(0, maxChars - 1))}-`);
            line = word.slice(Math.max(0, maxChars - 1));
          } else {
            line = word;
          }
        }
      });

      if (line) {
        lines.push(line);
      }

      return lines;
    };

    const drawPageHeader = (isFirstPage: boolean) => {
      if (isFirstPage) {
        rect(0, pageHeight - 136, pageWidth, 136, { fill: [0.06, 0.16, 0.34] });
        rect(0, pageHeight - 144, pageWidth, 8, { fill: [0.2, 0.47, 0.95] });
        text('EZTest Test Run Report', marginX, pageHeight - 58, { size: 24, bold: true, color: [1, 1, 1] });
        text(`Generated: ${new Date().toISOString()}`, marginX, pageHeight - 82, {
          size: 10,
          color: [0.86, 0.91, 1],
        });
        text(`Run: ${truncate(input.testRun.name, 70)}`, marginX, pageHeight - 102, {
          size: 11,
          color: [0.9, 0.95, 1],
        });
        y = pageHeight - 170;
      } else {
        rect(0, pageHeight - 48, pageWidth, 48, { fill: [0.95, 0.97, 1] });
        text('EZTest Test Run Report', marginX, pageHeight - 30, { size: 12, bold: true, color: [0.08, 0.18, 0.36] });
        y = pageHeight - 70;
      }
    };

    const startPage = (isFirstPage: boolean) => {
      currentPage = [];
      drawPageHeader(isFirstPage);
    };

    const finishPage = () => {
      text(`Page ${pageCommands.length + 1}`, pageWidth - marginX - 36, 20, { size: 9, color: [0.45, 0.5, 0.6] });
      pageCommands.push(currentPage);
    };

    const ensureSpace = (requiredHeight: number) => {
      if (y - requiredHeight < bottomMargin) {
        finishPage();
        startPage(false);
      }
    };

    const sectionTitle = (title: string) => {
      ensureSpace(34);
      text(title, marginX, y, { size: 14, bold: true, color: [0.08, 0.18, 0.36] });
      rect(marginX, y - 8, pageWidth - marginX * 2, 2, { fill: [0.22, 0.5, 0.96] });
      y -= 26;
    };

    const infoRows = (rows: Array<{ label: string; value: string }>) => {
      rows.forEach((row, index) => {
        const wrapped = wrapText(row.value || '-', 10, pageWidth - marginX * 2 - 150);
        const rowHeight = Math.max(26, wrapped.length * 14 + 10);
        ensureSpace(rowHeight + 4);
        rect(marginX, y - rowHeight + 6, pageWidth - marginX * 2, rowHeight, {
          fill: index % 2 === 0 ? [0.98, 0.99, 1] : [0.95, 0.97, 1],
          stroke: [0.87, 0.9, 0.96],
          lineWidth: 0.5,
        });
        text(row.label, marginX + 10, y - 12, { size: 10, bold: true, color: [0.15, 0.21, 0.31] });
        wrapped.forEach((line, lineIndex) => {
          text(line, marginX + 148, y - 12 - lineIndex * 14, { size: 10, color: [0.1, 0.14, 0.2] });
        });
        y -= rowHeight + 2;
      });
      y -= 8;
    };

    const metricCards = (
      cards: Array<{ title: string; value: string; tone: [number, number, number] }>,
      perRow = 3
    ) => {
      const gap = 10;
      const cardWidth = (pageWidth - marginX * 2 - gap * (perRow - 1)) / perRow;
      const cardHeight = 70;

      cards.forEach((card, index) => {
        const col = index % perRow;
        if (col === 0) {
          ensureSpace(cardHeight + 8);
        }

        const x = marginX + col * (cardWidth + gap);
        const yTop = y;
        rect(x, yTop - cardHeight + 6, cardWidth, cardHeight, {
          fill: [0.98, 0.99, 1],
          stroke: [0.86, 0.9, 0.96],
          lineWidth: 0.6,
        });
        rect(x, yTop - 4, cardWidth, 4, { fill: card.tone });
        text(truncate(card.title, 26), x + 10, yTop - 22, { size: 9, bold: true, color: [0.27, 0.31, 0.38] });
        text(card.value, x + 10, yTop - 48, { size: 18, bold: true, color: [0.1, 0.14, 0.22] });

        if (col === perRow - 1 || index === cards.length - 1) {
          y -= cardHeight + 10;
        }
      });

      y -= 6;
    };

    const table = (
      title: string,
      columns: Array<{ key: string; label: string; width: number }>,
      rows: Array<Record<string, string>>
    ) => {
      sectionTitle(title);

      if (rows.length === 0) {
        ensureSpace(26);
        rect(marginX, y - 20, pageWidth - marginX * 2, 20, { fill: [0.98, 0.99, 1], stroke: [0.88, 0.9, 0.95], lineWidth: 0.5 });
        text('No records available', marginX + 10, y - 14, { size: 10, color: [0.38, 0.43, 0.52] });
        y -= 30;
        return;
      }

      const headerHeight = 24;
      const drawHeader = () => {
        ensureSpace(headerHeight + 8);
        rect(marginX, y - headerHeight + 6, pageWidth - marginX * 2, headerHeight, { fill: [0.12, 0.25, 0.46] });
        let x = marginX + 8;
        columns.forEach((column) => {
          text(column.label, x, y - 11, { size: 9, bold: true, color: [1, 1, 1] });
          x += column.width;
        });
        y -= headerHeight + 2;
      };

      drawHeader();

      rows.forEach((row, rowIndex) => {
        const lineCounts = columns.map((column) => wrapText(row[column.key] || '-', 9, column.width - 10).length);
        const rowHeight = Math.max(20, Math.min(56, Math.max(...lineCounts) * 12 + 8));

        if (y - rowHeight < bottomMargin) {
          finishPage();
          startPage(false);
          sectionTitle(`${title} (cont.)`);
          drawHeader();
        }

        rect(marginX, y - rowHeight + 6, pageWidth - marginX * 2, rowHeight, {
          fill: rowIndex % 2 === 0 ? [1, 1, 1] : [0.97, 0.98, 1],
          stroke: [0.89, 0.92, 0.97],
          lineWidth: 0.4,
        });

        let x = marginX + 8;
        columns.forEach((column) => {
          const wrapped = wrapText(row[column.key] || '-', 9, column.width - 10);
          wrapped.slice(0, 3).forEach((line, lineIndex) => {
            text(line, x, y - 11 - lineIndex * 12, { size: 9, color: [0.14, 0.17, 0.23] });
          });
          x += column.width;
        });

        y -= rowHeight + 2;
      });

      y -= 8;
    };

    startPage(true);

    sectionTitle('Overview');
    infoRows([
      { label: 'Run Name', value: input.testRun.name },
      { label: 'Run ID', value: input.testRun.id },
      { label: 'Project', value: `${input.testRun.projectName} (${input.testRun.projectKey})` },
      { label: 'Status', value: input.testRun.status },
      { label: 'Environment', value: input.testRun.environment || '-' },
      { label: 'Assigned To', value: input.testRun.assignedTo },
      { label: 'Created By', value: input.testRun.createdBy },
      { label: 'Started At', value: input.testRun.startedAt },
      { label: 'Completed At', value: input.testRun.completedAt },
      { label: 'Description', value: input.testRun.description || '-' },
    ]);

    sectionTitle('Key Metrics');
    metricCards([
      { title: 'Total Results', value: `${input.stats.totalResults}`, tone: [0.23, 0.5, 0.95] },
      { title: 'Passed', value: `${input.stats.passed} (${input.stats.passRate}%)`, tone: [0.13, 0.66, 0.34] },
      { title: 'Failed', value: `${input.stats.failed} (${input.stats.failRate}%)`, tone: [0.86, 0.18, 0.23] },
      { title: 'Blocked', value: `${input.stats.blocked} (${input.stats.blockedRate}%)`, tone: [0.98, 0.63, 0.2] },
      { title: 'Skipped', value: `${input.stats.skipped} (${input.stats.skippedRate}%)`, tone: [0.52, 0.58, 0.66] },
      { title: 'Retest', value: `${input.stats.retest} (${input.stats.retestRate}%)`, tone: [0.42, 0.35, 0.85] },
      { title: 'Defects', value: `${input.stats.defectsCount}`, tone: [0.73, 0.26, 0.7] },
      { title: 'Duration (sec)', value: `${input.stats.totalDuration}`, tone: [0.0, 0.66, 0.72] },
      { title: 'Duration (min)', value: `${input.stats.totalDurationMinutes}`, tone: [0.0, 0.66, 0.72] },
    ]);

    sectionTitle('Executive Summary');
    ensureSpace(72);
    rect(marginX, y - 58, pageWidth - marginX * 2, 58, {
      fill: [0.97, 0.98, 1],
      stroke: [0.86, 0.9, 0.96],
      lineWidth: 0.6,
    });
    rect(marginX, y - 58, 6, 58, { fill: summaryColor });
    text(`Overall: ${summaryLabel}`, marginX + 14, y - 23, { size: 13, bold: true, color: summaryColor });
    text(`Pass rate: ${passRateValue}% | Failed: ${input.stats.failed} | Blocked: ${input.stats.blocked}`, marginX + 14, y - 39, {
      size: 10,
      color: [0.16, 0.2, 0.3],
    });
    text(summaryText, marginX + 14, y - 53, {
      size: 10,
      color: [0.2, 0.25, 0.35],
    });
    y -= 70;

    table(
      'Failed/Blocked Cases',
      [
        { key: 'index', label: '#', width: 22 },
        { key: 'tcId', label: 'TC ID', width: 68 },
        { key: 'title', label: 'Title', width: 210 },
        { key: 'status', label: 'Status', width: 64 },
        { key: 'executedBy', label: 'Executed By', width: 95 },
        { key: 'comment', label: 'Comment', width: 56 },
      ],
      input.topFailedCases.map((item, index) => ({
        index: `${index + 1}`,
        tcId: item.tcId,
        title: truncate(item.title, 85),
        status: item.status,
        executedBy: truncate(item.executedBy, 30),
        comment: truncate(item.comment || '-', 28),
      }))
    );

    table(
      'Defects',
      [
        { key: 'index', label: '#', width: 22 },
        { key: 'defectId', label: 'Defect ID', width: 80 },
        { key: 'title', label: 'Title', width: 230 },
        { key: 'status', label: 'Status', width: 72 },
        { key: 'severity', label: 'Severity', width: 66 },
        { key: 'assignedTo', label: 'Assigned To', width: 85 },
      ],
      input.defects.map((item, index) => ({
        index: `${index + 1}`,
        defectId: item.defectId,
        title: truncate(item.title, 95),
        status: item.status,
        severity: item.severity,
        assignedTo: truncate(item.assignedTo, 30),
      }))
    );

    finishPage();

    const pageStreams = pageCommands.map((commands) => commands.join('\n'));
    return this.buildPdfFromStreams(pageStreams);
  }

  private buildPdfFromStreams(pageStreams: string[]): Buffer {
    const pageWidth = 595;
    const pageHeight = 842;
    const objects: string[] = [];
    const addObject = (content: string) => {
      objects.push(content);
      return objects.length;
    };

    const fontRegularObj = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    const fontBoldObj = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

    const pageObjIds: number[] = [];
    const contentObjIds: number[] = [];

    pageStreams.forEach((stream) => {
      const contentObj = addObject(`<< /Length ${Buffer.byteLength(stream, 'utf-8')} >>\nstream\n${stream}\nendstream`);
      contentObjIds.push(contentObj);
      pageObjIds.push(0);
    });

    const pagesObj = addObject('<< /Type /Pages /Kids [] /Count 0 >>');

    pageObjIds.forEach((_, idx) => {
      const pageObj = addObject(
        `<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegularObj} 0 R /F2 ${fontBoldObj} 0 R >> >> /Contents ${contentObjIds[idx]} 0 R >>`
      );
      pageObjIds[idx] = pageObj;
    });

    objects[pagesObj - 1] = `<< /Type /Pages /Kids [${pageObjIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjIds.length} >>`;

    const catalogObj = addObject(`<< /Type /Catalog /Pages ${pagesObj} 0 R >>`);

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];
    objects.forEach((obj, idx) => {
      offsets.push(Buffer.byteLength(pdf, 'utf-8'));
      pdf += `${idx + 1} 0 obj\n${obj}\nendobj\n`;
    });

    const xrefStart = Buffer.byteLength(pdf, 'utf-8');
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    for (let i = 1; i <= objects.length; i++) {
      pdf += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
    }

    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return Buffer.from(pdf, 'utf-8');
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

