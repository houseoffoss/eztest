import { testRunService } from '@/backend/services/testrun/services';
import { emailService } from '@/backend/services/email/services';
import { 
  createTestRunSchema, 
  updateTestRunSchema, 
  addTestResultSchema 
} from '@/backend/validators/testrun.validator';
import { ValidationException } from '@/backend/utils/exceptions';
import { TestRunMessages } from '@/backend/constants/static_messages';

export class TestRunController {
  /**
   * Get all test runs for a project
   */
  async getProjectTestRuns(
    projectId: string,
    filters?: {
      status?: string;
      assignedToId?: string;
      environment?: string;
      search?: string;
    }
  ) {
    const testRuns = await testRunService.getProjectTestRuns(
      projectId,
      filters
    );

    return { data: testRuns };
  }

  /**
   * Get a single test run by ID
   */
  async getTestRunById(
    testRunId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId: string
  ) {
    const testRun = await testRunService.getTestRunById(testRunId);

    if (!testRun) {
      throw new ValidationException(TestRunMessages.TestRunNotFound);
    }

    // Get statistics
    const stats = await testRunService.getTestRunStats(testRunId);

    return {
      data: {
        ...testRun,
        stats,
      },
    };
  }

  /**
   * Create a new test run
   */
  async createTestRun(
    body: unknown,
    projectId: string,
    userId: string
  ) {
    const validationResult = createTestRunSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;

    // Sanitize assignedToId - convert empty string or 'none' to undefined
    let assignedToId = validatedData.assignedToId;
    if (!assignedToId || assignedToId === 'none' || assignedToId === '') {
      assignedToId = undefined;
    }

    const testRun = await testRunService.createTestRun({
      projectId,
      name: validatedData.name,
      description: validatedData.description,
      assignedToId,
      environment: validatedData.environment,
      status: validatedData.status,
      testCaseIds: validatedData.testCaseIds,
      createdById: userId,
    });

    return { data: testRun, statusCode: 201 };
  }

  /**
   * Update a test run
   */
  async updateTestRun(
    body: unknown,
    testRunId: string
  ) {
    const validationResult = updateTestRunSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;

    const testRun = await testRunService.updateTestRun(testRunId, validatedData);

    return { data: testRun };
  }

  /**
   * Delete a test run
   */
  async deleteTestRun(testRunId: string) {
    await testRunService.deleteTestRun(testRunId);

    return { message: TestRunMessages.TestRunDeletedSuccessfully };
  }

  /**
   * Start a test run
   */
  async startTestRun(testRunId: string) {
    const testRun = await testRunService.startTestRun(testRunId);

    return { data: testRun };
  }

  /**
   * Complete a test run
   */
  async completeTestRun(testRunId: string) {
    const testRun = await testRunService.completeTestRun(testRunId);
    
    // Check if email service is available for report sending
    const emailAvailable = await emailService.isEmailServiceAvailable();

    return {
      data: {
        ...testRun,
        emailAvailable,
        emailStatusMessage: emailAvailable
          ? 'Email service is available. You can send report to recipients.'
          : 'Email service is not configured. Report cannot be sent.',
      },
    };
  }

  /**
   * Add test result to test run
   */
  async addTestResult(
    body: unknown,
    testRunId: string,
    userId: string
  ) {
    const validationResult = addTestResultSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;

    const result = await testRunService.addTestResult(
      testRunId,
      validatedData.testCaseId,
      {
        status: validatedData.status,
        executedById: userId,
        duration: validatedData.duration,
        comment: validatedData.comment,
        errorMessage: validatedData.errorMessage,
        stackTrace: validatedData.stackTrace,
      }
    );

    return { data: result, statusCode: 201 };
  }

  /**
   * Check XML for matching test cases before import
   */
  async checkXMLMatches(
    xmlContent: string,
    projectId: string
  ) {
    const result = await testRunService.checkXMLTestCasesMatch(
      xmlContent,
      projectId
    );

    return {
      data: result,
      statusCode: 200,
    };
  }

  /**
   * Upload and parse TestNG XML results
   */
  async uploadTestNGXML(
    xmlContent: string,
    testRunId: string,
    userId: string
  ) {
    // Get test run to get projectId
    const testRun = await testRunService.getTestRunById(testRunId);
    if (!testRun) {
      throw new ValidationException(TestRunMessages.TestRunNotFound);
    }

    const result = await testRunService.parseTestNGXMLAndImportResults(
      xmlContent,
      testRunId,
      testRun.projectId,
      userId
    );

    return {
      data: result,
      statusCode: 200,
    };
  }

  /**
   * Send test run report via email
   */
  async sendTestRunReport(testRunId: string, userId: string) {
    // Check if test run exists
    const testRun = await testRunService.getTestRunById(testRunId);
    if (!testRun) {
      throw new ValidationException(TestRunMessages.TestRunNotFound);
    }

    const appUrl = process.env.NEXTAUTH_URL || process.env.APP_URL || 'http://localhost:3000';

    // Delegate to service to get validated recipients and send emails
    const result = await testRunService.sendTestRunReport(
      testRunId,
      userId,
      appUrl
    );

    return { data: result };
  }
}

export const testRunController = new TestRunController();
