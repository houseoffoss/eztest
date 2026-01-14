import { prisma } from '@/lib/prisma';
import { AutomationReportInput } from '@/backend/validators/automation-report.validator';

export class AutomationReportService {
  /**
   * Import automation report - creates test run and records all test results
   */
  async importAutomationReport(
    projectId: string,
    report: AutomationReportInput,
    userId: string
  ) {
    // Step 1: Create test run with unique name (append timestamp)
    // Format: "Original Name - YYYY-MM-DD HH:MM:SS"
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const uniqueTestRunName = `${report.testRunName} - ${timestamp}`;

    const testRun = await prisma.testRun.create({
      data: {
        projectId,
        name: uniqueTestRunName,
        environment: report.environment,
        description: report.description || `Automated test execution report`,
        status: 'IN_PROGRESS',
        createdById: userId,
        startedAt: new Date(),
      },
    });

    // Step 2: Process each test result
    const processedResults = [];
    const errors = [];

    for (const result of report.results) {
      try {
        // Find test case by tcId (e.g., "TC-1") or database ID (UUID)
        // First, try to find by tcId if it looks like "TC-XXX" format
        let testCase = null;
        const isTcIdFormat = /^TC-\d+$/i.test(result.testCaseId);
        
        if (isTcIdFormat) {
          // Find by tcId within the project
          testCase = await prisma.testCase.findFirst({
            where: {
              projectId,
              tcId: result.testCaseId.toUpperCase(), // Normalize to uppercase
            },
          });
        }
        
        // If not found by tcId, try database ID
        if (!testCase) {
          testCase = await prisma.testCase.findUnique({
            where: { id: result.testCaseId },
          });
        }

        // Verify test case exists and belongs to the project
        if (!testCase) {
          errors.push({
            testCaseId: result.testCaseId,
            error: `Test case not found: ${result.testCaseId}`,
          });
          continue;
        }

        if (testCase.projectId !== projectId) {
          errors.push({
            testCaseId: result.testCaseId,
            error: `Test case does not belong to this project: ${result.testCaseId}`,
          });
          continue;
        }

        // Step 3: Record test result
        const testResult = await prisma.testResult.upsert({
          where: {
            testRunId_testCaseId: {
              testRunId: testRun.id,
              testCaseId: testCase.id,
            },
          },
          update: {
            status: result.status,
            duration: result.duration,
            comment: result.comment,
            errorMessage: result.errorMessage,
            stackTrace: result.stackTrace,
            executedById: userId,
            executedAt: new Date(),
          },
          create: {
            testRunId: testRun.id,
            testCaseId: testCase.id,
            status: result.status,
            duration: result.duration,
            comment: result.comment,
            errorMessage: result.errorMessage,
            stackTrace: result.stackTrace,
            executedById: userId,
            executedAt: new Date(),
          },
        });

        processedResults.push({
          testCaseId: testCase.id,
          status: testResult.status,
          resultId: testResult.id,
        });
      } catch (error) {
        errors.push({
          testCaseId: result.testCaseId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    // Step 4: Complete test run if all results processed
    if (errors.length === 0) {
      await prisma.testRun.update({
        where: { id: testRun.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }

    return {
      testRunId: testRun.id,
      testRunName: testRun.name,
      environment: testRun.environment,
      processedCount: processedResults.length,
      errorCount: errors.length,
      results: processedResults,
      errors: errors.length > 0 ? errors : undefined,
    };
  }
}

export const automationReportService = new AutomationReportService();

