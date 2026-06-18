import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

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
      allCases: testRun.results
        .map((r) => ({
          tcId: r.testCase.tcId,
          title: r.testCase.title,
          status: r.status,
          priority: r.testCase.priority || '-',
        }))
        .sort((a, b) => a.tcId.localeCompare(b.tcId)),
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
    allCases: Array<{
      tcId: string;
      title: string;
      status: string;
      priority: string;
    }>;
  }): Buffer {
    const pageWidth = 595;
    const pageHeight = 842;
    const marginX = 40;
    const bottomMargin = 36;
    const passRateValue = input.stats.passRate;
    const hasCriticalOutcome = input.stats.failed > 0 || input.stats.blocked > 0;
    const summaryLabel = hasCriticalOutcome ? 'Требует внимания' : 'Стабильно';
    const summaryColor: [number, number, number] = hasCriticalOutcome ? [0.82, 0.22, 0.28] : [0.15, 0.62, 0.4];
    const summaryText = hasCriticalOutcome
      ? 'В прогоне есть проваленные или заблокированные кейсы. В первую очередь проверьте эти кейсы и связанные дефекты.'
      : 'Прогон стабильный: нет проваленных и заблокированных кейсов. При необходимости проверьте пропущенные и ретест.';

    const statusLabels: Record<string, string> = {
      PASSED: 'Успешно',
      FAILED: 'Провалено',
      BLOCKED: 'Заблокировано',
      SKIPPED: 'Пропущено',
      RETEST: 'Ретест',
      NOT_RUN: 'Не запускался',
      PLANNED: 'Запланирован',
      IN_PROGRESS: 'Выполняется',
      COMPLETED: 'Завершен',
      CANCELLED: 'Отменен',
    };

    const priorityLabels: Record<string, string> = {
      LOW: 'Низкий',
      MEDIUM: 'Средний',
      HIGH: 'Высокий',
      CRITICAL: 'Критический',
    };

    const toRuStatus = (status: string) => statusLabels[status] || status;
    const toRuPriority = (priority: string) => priorityLabels[priority] || priority;
    let y = pageHeight;

    const pageCommands: string[][] = [];
    let currentPage: string[] = [];
    const usedChars = new Set<string>();

    const sanitize = (value: string) =>
      value
        .replace(/[\n\r\t]+/g, ' ')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    const encodePdfHexText = (value: string) => {
      const clean = sanitize(value || '-');
      const bytes: number[] = [];

      for (let i = 0; i < clean.length; i += 1) {
        const codePoint = clean.codePointAt(i);
        if (codePoint === undefined) {
          continue;
        }

        if (codePoint > 0xffff) {
          // Skip unsupported surrogate pairs for current Type0 single-CID mapping.
          i += 1;
          continue;
        }

        const ch = String.fromCodePoint(codePoint);
        usedChars.add(ch);
        bytes.push((codePoint >> 8) & 0xff, codePoint & 0xff);
      }

      return `<${Buffer.from(bytes).toString('hex')}>`;
    };

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
        `BT /${font} ${size} Tf ${r} ${g} ${b} rg 1 0 0 1 ${x.toFixed(2)} ${yPos.toFixed(2)} Tm ${encodePdfHexText(value)} Tj ET`
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

    const drawCircularPassFail = (
      centerX: number,
      centerY: number,
      outerRadius: number,
      innerRadius: number,
      passPercent: number
    ) => {
      const clampedPass = Math.max(0, Math.min(100, passPercent));
      const passAngle = (clampedPass / 100) * 360;
      const innerFill: [number, number, number] = [0.95, 0.99, 0.98];

      const drawDonutSegment = (startDeg: number, endDeg: number, color: [number, number, number]) => {
        if (endDeg <= startDeg) {
          return;
        }

        const step = 6;
        const pointsOuter: Array<{ x: number; y: number }> = [];
        const pointsInner: Array<{ x: number; y: number }> = [];

        const toXY = (deg: number, radius: number) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          return {
            x: centerX + Math.cos(rad) * radius,
            y: centerY + Math.sin(rad) * radius,
          };
        };

        for (let deg = startDeg; deg <= endDeg; deg += step) {
          pointsOuter.push(toXY(Math.min(deg, endDeg), outerRadius));
        }
        if (pointsOuter[pointsOuter.length - 1]?.x !== toXY(endDeg, outerRadius).x || pointsOuter[pointsOuter.length - 1]?.y !== toXY(endDeg, outerRadius).y) {
          pointsOuter.push(toXY(endDeg, outerRadius));
        }

        for (let deg = endDeg; deg >= startDeg; deg -= step) {
          pointsInner.push(toXY(Math.max(deg, startDeg), innerRadius));
        }
        if (pointsInner[pointsInner.length - 1]?.x !== toXY(startDeg, innerRadius).x || pointsInner[pointsInner.length - 1]?.y !== toXY(startDeg, innerRadius).y) {
          pointsInner.push(toXY(startDeg, innerRadius));
        }

        if (pointsOuter.length === 0 || pointsInner.length === 0) {
          return;
        }

        const [r, g, b] = color;
        currentPage.push(`${r} ${g} ${b} rg`);
        currentPage.push(`${pointsOuter[0].x.toFixed(2)} ${pointsOuter[0].y.toFixed(2)} m`);
        pointsOuter.slice(1).forEach((point) => {
          currentPage.push(`${point.x.toFixed(2)} ${point.y.toFixed(2)} l`);
        });
        pointsInner.forEach((point) => {
          currentPage.push(`${point.x.toFixed(2)} ${point.y.toFixed(2)} l`);
        });
        currentPage.push('h f');
      };

      const drawFilledCircle = (cx: number, cy: number, radius: number, fill: [number, number, number], stroke?: [number, number, number]) => {
        const k = 0.5522847498;
        const c = radius * k;
        const [fr, fg, fb] = fill;
        currentPage.push(`${fr} ${fg} ${fb} rg`);
        if (stroke) {
          const [sr, sg, sb] = stroke;
          currentPage.push(`${sr} ${sg} ${sb} RG`);
        }
        currentPage.push(`${(cx + radius).toFixed(2)} ${cy.toFixed(2)} m`);
        currentPage.push(
          `${(cx + radius).toFixed(2)} ${(cy + c).toFixed(2)} ${(cx + c).toFixed(2)} ${(cy + radius).toFixed(2)} ${cx.toFixed(2)} ${(cy + radius).toFixed(2)} c`
        );
        currentPage.push(
          `${(cx - c).toFixed(2)} ${(cy + radius).toFixed(2)} ${(cx - radius).toFixed(2)} ${(cy + c).toFixed(2)} ${(cx - radius).toFixed(2)} ${cy.toFixed(2)} c`
        );
        currentPage.push(
          `${(cx - radius).toFixed(2)} ${(cy - c).toFixed(2)} ${(cx - c).toFixed(2)} ${(cy - radius).toFixed(2)} ${cx.toFixed(2)} ${(cy - radius).toFixed(2)} c`
        );
        currentPage.push(
          `${(cx + c).toFixed(2)} ${(cy - radius).toFixed(2)} ${(cx + radius).toFixed(2)} ${(cy - c).toFixed(2)} ${(cx + radius).toFixed(2)} ${cy.toFixed(2)} c`
        );
        currentPage.push(stroke ? 'b' : 'f');
      };

      // Remaining/failed portion.
      drawDonutSegment(passAngle, 360, [0.82, 0.22, 0.28]);
      // Passed portion.
      drawDonutSegment(0, passAngle, [0.15, 0.62, 0.4]);

      // Inner circle mask.
      drawFilledCircle(centerX, centerY, innerRadius, innerFill, [0.82, 0.92, 0.9]);

      text(`${clampedPass}%`, centerX - 16, centerY + 4, { size: 14, bold: true, color: [0.07, 0.25, 0.36] });
      text('успешно', centerX - 18, centerY - 12, { size: 8, color: [0.23, 0.31, 0.37] });
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
        rect(0, pageHeight - 136, pageWidth, 136, { fill: [0.07, 0.24, 0.36] });
        rect(0, pageHeight - 144, pageWidth, 8, { fill: [0.07, 0.67, 0.58] });
        text('EZTest - Отчет по тест-рану', marginX, pageHeight - 58, { size: 22, bold: true, color: [1, 1, 1] });
        text(`Сформировано: ${new Date().toISOString()}`, marginX, pageHeight - 82, {
          size: 10,
          color: [0.85, 0.95, 0.95],
        });
        text(`Тест-ран: ${truncate(input.testRun.name, 70)}`, marginX, pageHeight - 102, {
          size: 11,
          color: [0.89, 0.97, 0.97],
        });
        y = pageHeight - 170;
      } else {
        rect(0, pageHeight - 48, pageWidth, 48, { fill: [0.93, 0.97, 0.96] });
        text('EZTest - Отчет по тест-рану', marginX, pageHeight - 30, { size: 12, bold: true, color: [0.08, 0.24, 0.36] });
        y = pageHeight - 70;
      }
    };

    const startPage = (isFirstPage: boolean) => {
      currentPage = [];
      drawPageHeader(isFirstPage);
    };

    const finishPage = () => {
      text(`Стр. ${pageCommands.length + 1}`, pageWidth - marginX - 36, 20, { size: 9, color: [0.45, 0.5, 0.6] });
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
      text(title, marginX, y, { size: 14, bold: true, color: [0.07, 0.25, 0.36] });
      rect(marginX, y - 8, pageWidth - marginX * 2, 2, { fill: [0.07, 0.67, 0.58] });
      y -= 26;
    };

    const infoRows = (rows: Array<{ label: string; value: string }>) => {
      rows.forEach((row, index) => {
        const wrapped = wrapText(row.value || '-', 10, pageWidth - marginX * 2 - 150);
        const rowHeight = Math.max(26, wrapped.length * 14 + 10);
        ensureSpace(rowHeight + 4);
        rect(marginX, y - rowHeight + 6, pageWidth - marginX * 2, rowHeight, {
          fill: index % 2 === 0 ? [0.98, 1, 0.99] : [0.94, 0.98, 0.97],
          stroke: [0.82, 0.92, 0.9],
          lineWidth: 0.5,
        });
        text(row.label, marginX + 10, y - 12, { size: 10, bold: true, color: [0.14, 0.24, 0.3] });
        wrapped.forEach((line, lineIndex) => {
          text(line, marginX + 148, y - 12 - lineIndex * 14, { size: 10, color: [0.1, 0.16, 0.2] });
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
          fill: [0.98, 1, 0.99],
          stroke: [0.82, 0.92, 0.9],
          lineWidth: 0.6,
        });
        rect(x, yTop - 4, cardWidth, 4, { fill: card.tone });
        text(truncate(card.title, 26), x + 10, yTop - 22, { size: 9, bold: true, color: [0.2, 0.28, 0.35] });
        text(card.value, x + 10, yTop - 48, { size: 18, bold: true, color: [0.09, 0.16, 0.2] });

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
        rect(marginX, y - 20, pageWidth - marginX * 2, 20, { fill: [0.98, 1, 0.99], stroke: [0.82, 0.92, 0.9], lineWidth: 0.5 });
        text('Нет данных для отображения', marginX + 10, y - 14, { size: 10, color: [0.34, 0.41, 0.48] });
        y -= 30;
        return;
      }

      const headerHeight = 24;
      const drawHeader = () => {
        ensureSpace(headerHeight + 8);
        rect(marginX, y - headerHeight + 6, pageWidth - marginX * 2, headerHeight, { fill: [0.07, 0.35, 0.5] });
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
          sectionTitle(`${title} (продолжение)`);
          drawHeader();
        }

        rect(marginX, y - rowHeight + 6, pageWidth - marginX * 2, rowHeight, {
          fill: rowIndex % 2 === 0 ? [1, 1, 1] : [0.95, 0.99, 0.98],
          stroke: [0.84, 0.92, 0.9],
          lineWidth: 0.4,
        });

        let x = marginX + 8;
        columns.forEach((column) => {
          const wrapped = wrapText(row[column.key] || '-', 9, column.width - 10);
          wrapped.slice(0, 3).forEach((line, lineIndex) => {
            text(line, x, y - 11 - lineIndex * 12, { size: 9, color: [0.12, 0.19, 0.24] });
          });
          x += column.width;
        });

        y -= rowHeight + 2;
      });

      y -= 8;
    };

    startPage(true);

    sectionTitle('Обзор');
    infoRows([
      { label: 'Название тест-рана', value: input.testRun.name },
      { label: 'ID тест-рана', value: input.testRun.id },
      { label: 'Проект', value: `${input.testRun.projectName} (${input.testRun.projectKey})` },
      { label: 'Статус', value: toRuStatus(input.testRun.status) },
      { label: 'Окружение', value: input.testRun.environment || '-' },
      { label: 'Ответственный', value: input.testRun.assignedTo },
      { label: 'Создал', value: input.testRun.createdBy },
      { label: 'Начат', value: input.testRun.startedAt },
      { label: 'Завершен', value: input.testRun.completedAt },
      { label: 'Описание', value: input.testRun.description || '-' },
    ]);

    sectionTitle('Ключевые метрики');
    metricCards([
      { title: 'Всего результатов', value: `${input.stats.totalResults}`, tone: [0.07, 0.67, 0.58] },
      { title: 'Успешно', value: `${input.stats.passed} (${input.stats.passRate}%)`, tone: [0.15, 0.62, 0.4] },
      { title: 'Провалено', value: `${input.stats.failed} (${input.stats.failRate}%)`, tone: [0.82, 0.22, 0.28] },
      { title: 'Заблокировано', value: `${input.stats.blocked} (${input.stats.blockedRate}%)`, tone: [0.9, 0.55, 0.2] },
      { title: 'Пропущено', value: `${input.stats.skipped} (${input.stats.skippedRate}%)`, tone: [0.47, 0.55, 0.62] },
      { title: 'Ретест', value: `${input.stats.retest} (${input.stats.retestRate}%)`, tone: [0.43, 0.33, 0.7] },
      { title: 'Дефекты', value: `${input.stats.defectsCount}`, tone: [0.7, 0.3, 0.6] },
      { title: 'Длительность (сек)', value: `${input.stats.totalDuration}`, tone: [0.07, 0.67, 0.58] },
      { title: 'Длительность (мин)', value: `${input.stats.totalDurationMinutes}`, tone: [0.07, 0.67, 0.58] },
    ]);

    sectionTitle('Краткий вывод');
    ensureSpace(72);
    rect(marginX, y - 58, pageWidth - marginX * 2, 58, {
      fill: [0.95, 0.99, 0.98],
      stroke: [0.82, 0.92, 0.9],
      lineWidth: 0.6,
    });
    rect(marginX, y - 58, 6, 58, { fill: summaryColor });
    text(`Итог: ${summaryLabel}`, marginX + 14, y - 23, { size: 13, bold: true, color: summaryColor });
    text(`Процент успеха: ${passRateValue}% | Провалено: ${input.stats.failed} | Заблокировано: ${input.stats.blocked}`, marginX + 14, y - 39, {
      size: 10,
      color: [0.14, 0.22, 0.28],
    });
    text(summaryText, marginX + 14, y - 53, {
      size: 10,
      color: [0.16, 0.24, 0.31],
    });
    y -= 70;

    sectionTitle('Прогресс выполнения');
    ensureSpace(130);
    const chartCenterX = marginX + 88;
    const chartCenterY = y - 52;
    drawCircularPassFail(chartCenterX, chartCenterY, 38, 22, input.stats.passRate);

    const legendStartX = marginX + 170;
    const legendStartY = y - 22;
    rect(legendStartX, legendStartY, 10, 10, { fill: [0.15, 0.62, 0.4] });
    text(`Успешно: ${input.stats.passed}`, legendStartX + 16, legendStartY + 8, { size: 10, color: [0.12, 0.2, 0.26] });
    rect(legendStartX, legendStartY - 18, 10, 10, { fill: [0.82, 0.22, 0.28] });
    text(`Провалено/заблокировано: ${input.stats.failed + input.stats.blocked}`, legendStartX + 16, legendStartY - 10, {
      size: 10,
      color: [0.12, 0.2, 0.26],
    });
    rect(legendStartX, legendStartY - 36, 10, 10, { fill: [0.47, 0.55, 0.62] });
    text(`Пропущено/ретест: ${input.stats.skipped + input.stats.retest}`, legendStartX + 16, legendStartY - 28, {
      size: 10,
      color: [0.12, 0.2, 0.26],
    });
    y -= 116;

    table(
      'Проваленные и заблокированные кейсы',
      [
        { key: 'index', label: '#', width: 22 },
        { key: 'tcId', label: 'TC ID', width: 68 },
        { key: 'title', label: 'Название', width: 210 },
        { key: 'status', label: 'Статус', width: 64 },
        { key: 'executedBy', label: 'Исполнитель', width: 95 },
        { key: 'comment', label: 'Комментарий', width: 56 },
      ],
      input.topFailedCases.map((item, index) => ({
        index: `${index + 1}`,
        tcId: item.tcId,
        title: truncate(item.title, 85),
        status: toRuStatus(item.status),
        executedBy: truncate(item.executedBy, 30),
        comment: truncate(item.comment || '-', 28),
      }))
    );

    table(
      'Дефекты',
      [
        { key: 'index', label: '#', width: 22 },
        { key: 'defectId', label: 'ID дефекта', width: 80 },
        { key: 'title', label: 'Название', width: 230 },
        { key: 'status', label: 'Статус', width: 72 },
        { key: 'severity', label: 'Серьезность', width: 66 },
        { key: 'assignedTo', label: 'Ответственный', width: 85 },
      ],
      input.defects.map((item, index) => ({
        index: `${index + 1}`,
        defectId: item.defectId,
        title: truncate(item.title, 95),
        status: toRuStatus(item.status),
        severity: item.severity,
        assignedTo: truncate(item.assignedTo, 30),
      }))
    );

    table(
      'Состав тест-рана: все кейсы',
      [
        { key: 'index', label: '#', width: 26 },
        { key: 'tcId', label: 'TC ID', width: 84 },
        { key: 'title', label: 'Название кейса', width: 248 },
        { key: 'status', label: 'Статус', width: 88 },
        { key: 'priority', label: 'Приоритет', width: 69 },
      ],
      input.allCases.map((item, index) => ({
        index: `${index + 1}`,
        tcId: item.tcId,
        title: truncate(item.title, 110),
        status: toRuStatus(item.status),
        priority: toRuPriority(item.priority),
      }))
    );

    finishPage();

    const pageStreams = pageCommands.map((commands) => commands.join('\n'));
    try {
      return this.buildPdfFromStreams(pageStreams, usedChars);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error('[ExportService] buildPdfFromStreams failed:', msg, e);
      throw new Error(`PDF generation failed: ${msg}`);
    }
  }

  private buildPdfFromStreams(pageStreams: string[], usedChars: Set<string>): Buffer {
    const pageWidth = 595;
    const pageHeight = 842;
    const objects: string[] = [];
    const addObject = (content: string) => {
      objects.push(content);
      return objects.length;
    };

    const createHexEncodedStreamObject = (buffer: Buffer) => {
      const hex = buffer.toString('hex');
      return addObject(`<< /Length ${hex.length + 1} /Filter /ASCIIHexDecode >>\nstream\n${hex}>\nendstream`);
    };

    const createToUnicodeCMapObject = (chars: Set<string>) => {
      const codepoints = Array.from(chars)
        .map((ch) => ch.codePointAt(0) || 0)
        .filter((cp) => cp > 0 && cp <= 0xffff)
        .sort((a, b) => a - b);

      const lines: string[] = [
        '/CIDInit /ProcSet findresource begin',
        '12 dict begin',
        'begincmap',
        '/CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> def',
        '/CMapName /Identity-H def',
        '/CMapType 2 def',
        '1 begincodespacerange',
        '<0000> <FFFF>',
        'endcodespacerange',
      ];

      const chunkSize = 100;
      for (let i = 0; i < codepoints.length; i += chunkSize) {
        const chunk = codepoints.slice(i, i + chunkSize);
        lines.push(`${chunk.length} beginbfchar`);
        chunk.forEach((cp) => {
          const hex = cp.toString(16).padStart(4, '0').toUpperCase();
          lines.push(`<${hex}> <${hex}>`);
        });
        lines.push('endbfchar');
      }

      lines.push('endcmap');
      lines.push('CMapName currentdict /CMap defineresource pop');
      lines.push('end');
      lines.push('end');

      const cmapBuffer = Buffer.from(lines.join('\n'), 'utf-8');
      return createHexEncodedStreamObject(cmapBuffer);
    };

    const createTtfFontObjects = (fontPath: string, baseFontName: string, chars: Set<string>, toUnicodeObj: number) => {
      const fontBuffer = fs.readFileSync(fontPath);
      const tableCount = fontBuffer.readUInt16BE(4);
      const tables = new Map<string, { offset: number; length: number }>();

      for (let i = 0; i < tableCount; i += 1) {
        const offset = 12 + i * 16;
        const tag = fontBuffer.toString('ascii', offset, offset + 4);
        const tableOffset = fontBuffer.readUInt32BE(offset + 8);
        const length = fontBuffer.readUInt32BE(offset + 12);
        tables.set(tag, { offset: tableOffset, length });
      }

      const cmapTable = tables.get('cmap');
      const headTable = tables.get('head');
      const hheaTable = tables.get('hhea');
      const hmtxTable = tables.get('hmtx');
      const maxpTable = tables.get('maxp');
      if (!cmapTable || !headTable || !hheaTable || !hmtxTable || !maxpTable) {
        throw new Error('Font tables cmap/head/hhea/hmtx/maxp were not found');
      }

      const unitsPerEm = fontBuffer.readUInt16BE(headTable.offset + 18);
      const xMin = fontBuffer.readInt16BE(headTable.offset + 36);
      const yMin = fontBuffer.readInt16BE(headTable.offset + 38);
      const xMax = fontBuffer.readInt16BE(headTable.offset + 40);
      const yMax = fontBuffer.readInt16BE(headTable.offset + 42);
      const ascent = fontBuffer.readInt16BE(hheaTable.offset + 4);
      const descent = fontBuffer.readInt16BE(hheaTable.offset + 6);

      const numberOfHMetrics = fontBuffer.readUInt16BE(hheaTable.offset + 34);
      const numGlyphs = fontBuffer.readUInt16BE(maxpTable.offset + 4);
      const advanceWidths = new Array<number>(numGlyphs);
      let lastAdvanceWidth = unitsPerEm;

      for (let glyphIndex = 0; glyphIndex < numGlyphs; glyphIndex += 1) {
        if (glyphIndex < numberOfHMetrics) {
          const metricOffset = hmtxTable.offset + glyphIndex * 4;
          if (metricOffset + 1 < fontBuffer.length) {
            lastAdvanceWidth = fontBuffer.readUInt16BE(metricOffset);
          }
        }
        advanceWidths[glyphIndex] = lastAdvanceWidth;
      }

      const cmapOffset = cmapTable.offset;
      const numSubtables = fontBuffer.readUInt16BE(cmapOffset + 2);

      // Scan ALL subtables and pick the best *format-4* one (BMP Unicode).
      // Explicitly checking format avoids accidentally picking a format-12
      // (Full Repertoire) subtable that would throw "Unsupported cmap format: 12".
      let chosenSubtableOffset: number | null = null;
      let bestPriority = -1;

      for (let i = 0; i < numSubtables; i += 1) {
        const recOffset = cmapOffset + 4 + i * 8;
        const platformId = fontBuffer.readUInt16BE(recOffset);
        const encodingId = fontBuffer.readUInt16BE(recOffset + 2);
        const subtableRel = fontBuffer.readUInt32BE(recOffset + 4);
        const candidateOffset = cmapOffset + subtableRel;

        // Only accept format 4 subtables.
        if (fontBuffer.readUInt16BE(candidateOffset) !== 4) {
          continue;
        }

        // Windows BMP (3,1) is the ideal match for Latin + Cyrillic coverage.
        let priority = 0;
        if (platformId === 3 && encodingId === 1) {
          priority = 2;
        } else if (platformId === 0) {
          priority = 1;
        }

        if (priority > bestPriority) {
          bestPriority = priority;
          chosenSubtableOffset = candidateOffset;
          if (priority === 2) break; // Optimal match, no need to continue.
        }
      }

      if (chosenSubtableOffset === null) {
        throw new Error(`No format-4 cmap subtable found in font: ${baseFontName}`);
      }

      const segCount = fontBuffer.readUInt16BE(chosenSubtableOffset + 6) / 2;
      const endCodeOffset = chosenSubtableOffset + 14;
      const startCodeOffset = endCodeOffset + segCount * 2 + 2;
      const idDeltaOffset = startCodeOffset + segCount * 2;
      const idRangeOffsetOffset = idDeltaOffset + segCount * 2;

      const mapCodepointToGlyph = (codepoint: number) => {
        for (let i = 0; i < segCount; i += 1) {
          const endCode = fontBuffer.readUInt16BE(endCodeOffset + i * 2);
          const startCode = fontBuffer.readUInt16BE(startCodeOffset + i * 2);
          if (codepoint < startCode || codepoint > endCode) {
            continue;
          }

          const idDelta = fontBuffer.readInt16BE(idDeltaOffset + i * 2);
          const idRangeOffset = fontBuffer.readUInt16BE(idRangeOffsetOffset + i * 2);

          if (idRangeOffset === 0) {
            return (codepoint + idDelta) & 0xffff;
          }

          const glyphIndexAddress = idRangeOffsetOffset + i * 2 + idRangeOffset + (codepoint - startCode) * 2;
          if (glyphIndexAddress + 1 >= fontBuffer.length) {
            return 0;
          }

          let glyphIndex = fontBuffer.readUInt16BE(glyphIndexAddress);
          if (glyphIndex !== 0) {
            glyphIndex = (glyphIndex + idDelta) & 0xffff;
          }
          return glyphIndex;
        }
        return 0;
      };

      const codepoints = Array.from(chars)
        .map((ch) => ch.codePointAt(0) || 0)
        .filter((cp) => cp > 0 && cp <= 0xffff);
      const maxCodepoint = codepoints.length > 0 ? Math.max(...codepoints) : 0;
      const cidToGid = Buffer.alloc((maxCodepoint + 1) * 2);
      const cidWidths = new Map<number, number>();

      codepoints.forEach((codepoint) => {
        const glyphId = mapCodepointToGlyph(codepoint);
        cidToGid.writeUInt16BE(glyphId, codepoint * 2);
        if (glyphId > 0 && glyphId < advanceWidths.length) {
          const width = Math.max(1, Math.round((advanceWidths[glyphId] / unitsPerEm) * 1000));
          cidWidths.set(codepoint, width);
        }
      });

      const sortedCids = Array.from(cidWidths.keys()).sort((a, b) => a - b);
      const widthEntries: string[] = [];
      let runStart = -1;
      let runLast = -1;
      let runWidths: number[] = [];

      const flushRun = () => {
        if (runStart >= 0 && runWidths.length > 0) {
          widthEntries.push(`${runStart} [${runWidths.join(' ')}]`);
        }
      };

      sortedCids.forEach((cid) => {
        const width = cidWidths.get(cid);
        if (width === undefined) {
          return;
        }

        if (runStart === -1) {
          runStart = cid;
          runLast = cid;
          runWidths = [width];
          return;
        }

        if (cid === runLast + 1) {
          runLast = cid;
          runWidths.push(width);
          return;
        }

        flushRun();
        runStart = cid;
        runLast = cid;
        runWidths = [width];
      });
      flushRun();

      const defaultWidth =
        cidWidths.size > 0 ? Math.max(1, Math.round(Array.from(cidWidths.values()).reduce((sum, width) => sum + width, 0) / cidWidths.size)) : 500;
      const widthArray = widthEntries.length > 0 ? ` /W [${widthEntries.join(' ')}]` : '';

      const fontFileObj = createHexEncodedStreamObject(fontBuffer);
      const cidToGidObj = createHexEncodedStreamObject(cidToGid);

      const fontDescriptorObj = addObject(
        `<< /Type /FontDescriptor /FontName /${baseFontName} /Flags 32 /FontBBox [${xMin} ${yMin} ${xMax} ${yMax}] /ItalicAngle 0 /Ascent ${ascent} /Descent ${descent} /CapHeight ${ascent} /StemV 80 /FontFile2 ${fontFileObj} 0 R >>`
      );

      const cidFontObj = addObject(
        `<< /Type /Font /Subtype /CIDFontType2 /BaseFont /${baseFontName} /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${fontDescriptorObj} 0 R /DW ${defaultWidth}${widthArray} /CIDToGIDMap ${cidToGidObj} 0 R >>`
      );

      const type0FontObj = addObject(
        `<< /Type /Font /Subtype /Type0 /BaseFont /${baseFontName} /Encoding /Identity-H /DescendantFonts [${cidFontObj} 0 R] /ToUnicode ${toUnicodeObj} 0 R >>`
      );

      return type0FontObj;
    };

    const resolveFontPath = (fileName: string) => {
      const candidates = [
        path.resolve(process.cwd(), 'backend/assets/fonts', fileName),
        path.resolve(process.cwd(), 'public/fonts', fileName),
        path.resolve(process.cwd(), '.next/server/backend/assets/fonts', fileName),
        path.resolve(process.cwd(), '.next/standalone/backend/assets/fonts', fileName),
      ];

      const found = candidates.find((candidate) => fs.existsSync(candidate));
      if (!found) {
        throw new Error(`Font file not found: ${fileName}. Checked: ${candidates.join(', ')}`);
      }
      return found;
    };

    const regularFontPath = resolveFontPath('NotoSans-Regular.ttf');
    const boldFontPath = resolveFontPath('NotoSans-Bold.ttf');
    const toUnicodeObj = createToUnicodeCMapObject(usedChars);

    const fontRegularObj = createTtfFontObjects(regularFontPath, 'NotoSansRU', usedChars, toUnicodeObj);
    const fontBoldObj = createTtfFontObjects(boldFontPath, 'NotoSansRUBold', usedChars, toUnicodeObj);

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

    // Build PDF as a series of Buffer chunks to avoid encoding issues with
    // binary-like hex data embedded in the object streams.
    const chunks: Buffer[] = [];
    const enc = (s: string) => Buffer.from(s, 'latin1');
    const push = (s: string) => { chunks.push(enc(s)); };

    const offsets: number[] = [0];
    let bytePos = 0;

    push('%PDF-1.4\n');
    bytePos = chunks.reduce((sum, c) => sum + c.length, 0);

    objects.forEach((obj, idx) => {
      offsets.push(bytePos);
      const objStr = `${idx + 1} 0 obj\n${obj}\nendobj\n`;
      push(objStr);
      bytePos += Buffer.byteLength(objStr, 'latin1');
    });

    const xrefStart = bytePos;
    const xref = [
      `xref\n0 ${objects.length + 1}\n`,
      '0000000000 65535 f \n',
      ...Array.from({ length: objects.length }, (_, i) =>
        `${offsets[i + 1].toString().padStart(10, '0')} 00000 n \n`
      ),
      `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`,
    ].join('');
    push(xref);

    return Buffer.concat(chunks);
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

