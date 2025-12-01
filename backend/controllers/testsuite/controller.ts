import { NextRequest, NextResponse } from 'next/server';
import { TestSuiteService } from '@/backend/services/testsuite/services';
import { TestSuiteMessages } from '@/backend/constants/static_messages';

const testSuiteService = new TestSuiteService();

export class TestSuiteController {
  /**
   * Get all test suites for a project
   */
  async getProjectTestSuites(projectId: string) {
    try {
      const suites = await testSuiteService.getProjectTestSuites(projectId);

      return NextResponse.json({
        data: suites,
        message: TestSuiteMessages.TestSuitesFetchedSuccessfully,
      });
    } catch (error) {
      console.error('Error fetching test suites:', error);
      return NextResponse.json(
        { error: TestSuiteMessages.FailedToFetchTestSuite },
        { status: 500 }
      );
    }
  }

  /**
   * Get a single test suite by ID
   */
  async getTestSuiteById(suiteId: string, userId: string) {
    try {
      // Check access
      const hasAccess = await testSuiteService.hasAccessToTestSuite(suiteId, userId);
      if (!hasAccess) {
        return NextResponse.json(
          { error: TestSuiteMessages.AccessDeniedTestSuite },
          { status: 403 }
        );
      }

      const suite = await testSuiteService.getTestSuiteById(suiteId);

      if (!suite) {
        return NextResponse.json(
          { error: TestSuiteMessages.TestSuiteNotFound },
          { status: 404 }
        );
      }

      return NextResponse.json({
        data: suite,
        message: TestSuiteMessages.TestSuiteFetchedSuccessfully,
      });
    } catch (error) {
      console.error('Error fetching test suite:', error);
      return NextResponse.json(
        { error: TestSuiteMessages.FailedToFetchTestSuite },
        { status: 500 }
      );
    }
  }

  /**
   * Create a new test suite
   */
  async createTestSuite(request: NextRequest, projectId: string) {
    try {
      const body = await request.json();
      const { name, description, parentId, order } = body;

      if (!name || !name.trim()) {
        return NextResponse.json(
          { error: TestSuiteMessages.SuiteNameRequired },
          { status: 400 }
        );
      }

      const suite = await testSuiteService.createTestSuite({
        projectId,
        name: name.trim(),
        description: description?.trim(),
        parentId,
        order,
      });

      return NextResponse.json({
        data: suite,
        message: TestSuiteMessages.TestSuiteCreatedSuccessfully,
      });
    } catch (error) {
      console.error('Error creating test suite:', error);
      return NextResponse.json(
        { error: TestSuiteMessages.FailedToCreateTestSuite },
        { status: 500 }
      );
    }
  }

  /**
   * Update a test suite
   */
  async updateTestSuite(request: NextRequest, suiteId: string, userId: string) {
    try {
      // Check permissions
      const canManage = await testSuiteService.canManageTestSuite(suiteId, userId);
      if (!canManage) {
        return NextResponse.json(
          { error: TestSuiteMessages.AccessDeniedTestSuite },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { name, description, parentId, order } = body;

      const suite = await testSuiteService.updateTestSuite(suiteId, {
        name: name?.trim(),
        description: description?.trim(),
        parentId,
        order,
      });

      return NextResponse.json({
        data: suite,
        message: TestSuiteMessages.TestSuiteUpdatedSuccessfully,
      });
    } catch (error) {
      console.error('Error updating test suite:', error);
      return NextResponse.json(
        { error: TestSuiteMessages.FailedToUpdateTestSuite },
        { status: 500 }
      );
    }
  }

  /**
   * Delete a test suite
   */
  async deleteTestSuite(suiteId: string, userId: string) {
    try {
      // Check permissions
      const canManage = await testSuiteService.canManageTestSuite(suiteId, userId);
      if (!canManage) {
        return NextResponse.json(
          { error: TestSuiteMessages.AccessDeniedTestSuite },
          { status: 403 }
        );
      }

      await testSuiteService.deleteTestSuite(suiteId);

      return NextResponse.json({
        message: TestSuiteMessages.TestSuiteDeletedSuccessfully,
      });
    } catch (error) {
      console.error('Delete test suite error:', error);
      return NextResponse.json(
        { error: TestSuiteMessages.FailedToDeleteTestSuite },
        { status: 500 }
      );
    }
  }

  /**
   * Move test cases to a suite
   */
  async moveTestCasesToSuite(request: NextRequest) {
    try {
      const body = await request.json();
      const { testCaseIds, suiteId } = body;

      if (!Array.isArray(testCaseIds) || testCaseIds.length === 0) {
        return NextResponse.json(
          { error: 'No test cases provided' },
          { status: 400 }
        );
      }

      const result = await testSuiteService.moveTestCasesToSuite(testCaseIds, suiteId || null);

      return NextResponse.json({
        data: result,
        message: `${result.count} ${TestSuiteMessages.TestCasesMovedSuccessfully}`,
      });
    } catch (error) {
      console.error('Error moving test cases:', error);
      return NextResponse.json(
        { error: TestSuiteMessages.FailedToMoveTestCases },
        { status: 500 }
      );
    }
  }

  /**
   * Reorder suites
   */
  async reorderSuites(request: NextRequest) {
    try {
      const body = await request.json();
      const { updates } = body;

      if (!Array.isArray(updates) || updates.length === 0) {
        return NextResponse.json(
          { error: TestSuiteMessages.InvalidSuiteParent },
          { status: 400 }
        );
      }

      await testSuiteService.reorderSuites(updates);

      return NextResponse.json({
        message: TestSuiteMessages.TestSuitesReorderedSuccessfully,
      });
    } catch (error) {
      console.error('Error reordering test suites:', error);
      return NextResponse.json(
        { error: TestSuiteMessages.FailedToUpdateTestSuite },
        { status: 500 }
      );
    }
  }
}

export const testSuiteController = new TestSuiteController();
