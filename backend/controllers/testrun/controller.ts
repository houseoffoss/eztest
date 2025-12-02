import { NextRequest, NextResponse } from 'next/server';
import { testRunService } from '@/backend/services/testrun/services';
import { TestRunStatus, TestResultStatus } from '@prisma/client';
import { TestRunMessages } from '@/backend/constants/static_messages';

export class TestRunController {
  /**
   * Get all test runs for a project
   */
  async getProjectTestRuns(
    projectId: string,
    userId: string,
    filters?: {
      status?: TestRunStatus;
      assignedToId?: string;
      environment?: string;
      search?: string;
    }
  ) {
    try {
      const testRuns = await testRunService.getProjectTestRuns(
        projectId,
        filters
      );

      return NextResponse.json({ data: testRuns }, { status: 200 });
    } catch (error) {
      console.error('Get test runs error:', error);
      return NextResponse.json(
        { error: TestRunMessages.FailedToFetchTestRun },
        { status: 500 }
      );
    }
  }

  /**
   * Get a single test run by ID
   */
  async getTestRunById(
    testRunId: string,
    userId: string
  ) {
    try {
      // Check access
      const hasAccess = await testRunService.hasAccessToTestRun(
        testRunId,
        userId
      );

      if (!hasAccess) {
        return NextResponse.json(
          { error: TestRunMessages.AccessDeniedTestRun },
          { status: 403 }
        );
      }

      const testRun = await testRunService.getTestRunById(testRunId);

      if (!testRun) {
        return NextResponse.json(
          { error: TestRunMessages.TestRunNotFound },
          { status: 404 }
        );
      }

      // Get statistics
      const stats = await testRunService.getTestRunStats(testRunId);

      return NextResponse.json(
        {
          data: {
            ...testRun,
            stats,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Get test run error:', error);
      return NextResponse.json(
        { error: TestRunMessages.FailedToFetchTestRun },
        { status: 500 }
      );
    }
  }

  /**
   * Create a new test run
   */
  async createTestRun(
    request: NextRequest,
    projectId: string,
    userId: string
  ) {
    try {
      const body = await request.json();
      const { name, description, environment, testCaseIds } = body;
      let { assignedToId } = body;

      // Validation
      if (!name) {
        return NextResponse.json(
          { error: TestRunMessages.TestRunNameRequired },
          { status: 400 }
        );
      }

      // Sanitize assignedToId - convert empty string or 'none' to undefined
      if (!assignedToId || assignedToId === 'none' || assignedToId === '') {
        assignedToId = undefined;
      }

      const testRun = await testRunService.createTestRun({
        projectId,
        name,
        description,
        assignedToId,
        environment,
        testCaseIds,
        createdById: userId,
      });

      return NextResponse.json({ data: testRun }, { status: 201 });
    } catch (error) {
      console.error('Create test run error:', error);
      return NextResponse.json(
        { error: TestRunMessages.FailedToCreateTestRun },
        { status: 500 }
      );
    }
  }

  /**
   * Update a test run
   */
  async updateTestRun(
    request: NextRequest,
    testRunId: string,
    userId: string
  ) {
    try {
      // Check permission
      const canManage = await testRunService.canManageTestRun(
        testRunId,
        userId
      );

      if (!canManage) {
        return NextResponse.json(
          { error: TestRunMessages.AccessDeniedTestRun },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { name, description, status, assignedToId, environment } = body;

      // Validate status if provided
      if (status) {
        const validStatuses: TestRunStatus[] = [
          'PLANNED',
          'IN_PROGRESS',
          'COMPLETED',
          'CANCELLED',
        ];
        if (!validStatuses.includes(status)) {
          return NextResponse.json(
            { error: TestRunMessages.InvalidTestRunStatus },
            { status: 400 }
          );
        }
      }

      const testRun = await testRunService.updateTestRun(testRunId, {
        name,
        description,
        status,
        assignedToId,
        environment,
      });

      return NextResponse.json({ data: testRun }, { status: 200 });
    } catch (error) {
      console.error('Update test run error:', error);
      return NextResponse.json(
        { error: TestRunMessages.FailedToUpdateTestRun },
        { status: 500 }
      );
    }
  }

  /**
   * Delete a test run
   */
  async deleteTestRun(
    testRunId: string,
    userId: string
  ) {
    try {
      // Check permission
      const canManage = await testRunService.canManageTestRun(
        testRunId,
        userId
      );

      if (!canManage) {
        return NextResponse.json(
          { error: TestRunMessages.AccessDeniedTestRun },
          { status: 403 }
        );
      }

      await testRunService.deleteTestRun(testRunId);

      return NextResponse.json(
        { message: TestRunMessages.TestRunDeletedSuccessfully },
        { status: 200 }
      );
    } catch (error) {
      console.error('Delete test run error:', error);
      return NextResponse.json(
        { error: TestRunMessages.FailedToDeleteTestRun },
        { status: 500 }
      );
    }
  }

  /**
   * Start a test run
   */
  async startTestRun(
    testRunId: string,
    userId: string
  ) {
    try {
      // Check access
      const hasAccess = await testRunService.hasAccessToTestRun(
        testRunId,
        userId
      );

      if (!hasAccess) {
        return NextResponse.json(
          { error: TestRunMessages.AccessDeniedTestRun },
          { status: 403 }
        );
      }

      const testRun = await testRunService.startTestRun(testRunId);

      return NextResponse.json({ data: testRun }, { status: 200 });
    } catch (error) {
      console.error('Start test run error:', error);
      return NextResponse.json(
        { error: TestRunMessages.FailedToStartTestRun },
        { status: 500 }
      );
    }
  }

  /**
   * Complete a test run
   */
  async completeTestRun(
    testRunId: string,
    userId: string
  ) {
    try {
      // Check access
      const hasAccess = await testRunService.hasAccessToTestRun(
        testRunId,
        userId
      );

      if (!hasAccess) {
        return NextResponse.json(
          { error: TestRunMessages.AccessDeniedTestRun },
          { status: 403 }
        );
      }

      const testRun = await testRunService.completeTestRun(testRunId);

      return NextResponse.json({ data: testRun }, { status: 200 });
    } catch (error) {
      console.error('Complete test run error:', error);
      return NextResponse.json(
        { error: TestRunMessages.FailedToCompleteTestRun },
        { status: 500 }
      );
    }
  }

  /**
   * Add test result to test run
   */
  async addTestResult(
    request: NextRequest,
    testRunId: string,
    userId: string
  ) {
    try {
      // Check access
      const hasAccess = await testRunService.hasAccessToTestRun(
        testRunId,
        userId
      );

      if (!hasAccess) {
        return NextResponse.json(
          { error: TestRunMessages.AccessDeniedTestRun },
          { status: 403 }
        );
      }

      const body = await request.json();
      const {
        testCaseId,
        status,
        duration,
        comment,
        errorMessage,
        stackTrace,
      } = body;

      // Validation
      if (!testCaseId || !status) {
        return NextResponse.json(
          { error: TestRunMessages.InvalidTestRunStatus },
          { status: 400 }
        );
      }

      // Validate status
      const validStatuses: TestResultStatus[] = [
        'PASSED',
        'FAILED',
        'BLOCKED',
        'SKIPPED',
        'RETEST',
      ];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: TestRunMessages.InvalidTestRunStatus },
          { status: 400 }
        );
      }

      const result = await testRunService.addTestResult(
        testRunId,
        testCaseId,
        {
          status,
          executedById: userId,
          duration,
          comment,
          errorMessage,
          stackTrace,
        }
      );

      return NextResponse.json({ data: result }, { status: 201 });
    } catch (error) {
      console.error('Add test result error:', error);
      return NextResponse.json(
        { error: TestRunMessages.FailedToCompleteTestRun },
        { status: 500 }
      );
    }
  }
}

export const testRunController = new TestRunController();
