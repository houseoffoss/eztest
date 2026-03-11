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
      const updateData: {
        name?: string;
        description?: string | null;
        parentId?: string | null;
        order?: number;
      } = {};

      if (Object.prototype.hasOwnProperty.call(body, 'name')) {
        updateData.name = typeof name === 'string' ? name.trim() : name;
      }
      if (Object.prototype.hasOwnProperty.call(body, 'description')) {
        updateData.description = typeof description === 'string' ? description.trim() : null;
      }
      if (Object.prototype.hasOwnProperty.call(body, 'parentId')) {
        updateData.parentId = parentId ?? null;
      }
      if (Object.prototype.hasOwnProperty.call(body, 'order')) {
        updateData.order = order;
      }

      const suite = await testSuiteService.updateTestSuite(suiteId, updateData);

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

  /**
   * Add a module to a test suite
   * 
   * Assigns the specified module to all test cases in the suite.
   * This operation updates every test case in the suite to include the moduleId.
   * 
   * @param request - NextRequest containing the module ID in request body
   * @param suiteId - ID of the test suite to add module to
   * @param projectId - ID of the project (for validation)
   * 
   * @returns JSON response with:
   *   - data: Updated test suite with all test cases now assigned to module
   *   - message: Success or error message
   *   - status: HTTP status code (200 for success)
   * 
   * @throws 400 - If moduleId is missing from request body
   * @throws 404 - If test suite or module not found or doesn't belong to project
   * @throws 500 - Internal server error
   */
  async addModuleToSuite(request: NextRequest, suiteId: string, projectId: string) {
    try {
      const body = await request.json();
      const { moduleId } = body;

      if (!moduleId) {
        return NextResponse.json(
          { error: TestSuiteMessages.ModuleIDRequired },
          { status: 400 }
        );
      }

      const updatedSuite = await testSuiteService.addModuleToSuite(
        suiteId,
        moduleId,
        projectId
      );

      return NextResponse.json({
        data: updatedSuite,
        message: TestSuiteMessages.ModuleAddedToSuiteSuccessfully,
      });
    } catch (error: unknown) {
      console.error('Error adding module to suite:', error);
      const message = error instanceof Error ? error.message : TestSuiteMessages.FailedToAddModuleToSuite;
      return NextResponse.json(
        { error: message },
        { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
      );
    }
  }

  /**
   * Update module for a test suite
   */
  async updateSuiteModule(request: NextRequest, suiteId: string, projectId: string) {
    try {
      const body = await request.json();
      const { oldModuleId, newModuleId } = body;

      if (!newModuleId) {
        return NextResponse.json(
          { error: TestSuiteMessages.NewModuleIDRequired },
          { status: 400 }
        );
      }

      const updatedSuite = await testSuiteService.updateSuiteModule(
        suiteId,
        oldModuleId || null,
        newModuleId,
        projectId
      );

      return NextResponse.json({
        data: updatedSuite,
        message: TestSuiteMessages.ModuleUpdatedInSuiteSuccessfully,
      });
    } catch (error: unknown) {
      console.error('Error updating suite module:', error);
      const message = error instanceof Error ? error.message : TestSuiteMessages.FailedToUpdateModuleInSuite;
      return NextResponse.json(
        { error: message },
        { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
      );
    }
  }

  /**
   * Remove module from a test suite
   */
  async removeModuleFromSuite(request: NextRequest, suiteId: string, projectId: string) {
    try {
      const body = await request.json();
      const { moduleId } = body;

      if (!moduleId) {
        return NextResponse.json(
          { error: TestSuiteMessages.ModuleIDRequired },
          { status: 400 }
        );
      }

      const updatedSuite = await testSuiteService.removeModuleFromSuite(
        suiteId,
        moduleId,
        projectId
      );

      return NextResponse.json({
        data: updatedSuite,
        message: TestSuiteMessages.ModuleRemovedFromSuiteSuccessfully,
      });
    } catch (error: unknown) {
      console.error('Error removing module from suite:', error);
      const message = error instanceof Error ? error.message : TestSuiteMessages.FailedToRemoveModuleFromSuite;
      return NextResponse.json(
        { error: message },
        { status: error instanceof Error && error.message.includes('not found') ? 404 : 500 }
      );
    }
  }

  /**
   * Add test cases to a test suite
   */
  async addTestCasesToSuite(request: NextRequest, suiteId: string) {
    try {
      const body = await request.json();
      const { testCaseIds } = body;

      if (!testCaseIds || !Array.isArray(testCaseIds) || testCaseIds.length === 0) {
        return NextResponse.json(
          { error: TestSuiteMessages.TestCaseIDsRequired },
          { status: 400 }
        );
      }

      const result = await testSuiteService.addTestCasesToSuite(testCaseIds, suiteId);

      return NextResponse.json({
        data: result,
        message: TestSuiteMessages.TestCasesAddedToSuiteSuccessfully,
      });
    } catch (error) {
      console.error('Error adding test cases to suite:', error);
      return NextResponse.json(
        { error: TestSuiteMessages.FailedToAddTestCasesToSuite },
        { status: 500 }
      );
    }
  }

  /**
   * Remove test cases from a test suite
   */
  async removeTestCasesFromSuite(request: NextRequest, suiteId: string) {
    try {
      const body = await request.json();
      const { testCaseIds } = body;

      if (!testCaseIds || !Array.isArray(testCaseIds) || testCaseIds.length === 0) {
        return NextResponse.json(
          { error: TestSuiteMessages.TestCaseIDsRequired },
          { status: 400 }
        );
      }

      const result = await testSuiteService.removeTestCasesFromSuite(testCaseIds, suiteId);

      return NextResponse.json({
        data: result,
        message: TestSuiteMessages.TestCasesRemovedFromSuiteSuccessfully,
      });
    } catch (error) {
      console.error('Error removing test cases from suite:', error);
      return NextResponse.json(
        { error: TestSuiteMessages.FailedToRemoveTestCasesFromSuite },
        { status: 500 }
      );
    }
  }

  /**
   * Check which test cases are in a test suite
   */
  async checkTestCasesInSuite(request: NextRequest, suiteId: string) {
    try {
      const body = await request.json();
      const { testCaseIds } = body;

      if (!Array.isArray(testCaseIds) || testCaseIds.length === 0) {
        return NextResponse.json(
          { error: TestSuiteMessages.TestCaseIDsRequired },
          { status: 400 }
        );
      }

      const testCasesInSuite = await testSuiteService.checkTestCasesInSuite(testCaseIds, suiteId);

      return NextResponse.json({
        data: testCasesInSuite,
        message: TestSuiteMessages.TestCasesCheckedSuccessfully,
      });
    } catch (error) {
      console.error('Error checking test cases in suite:', error);
      return NextResponse.json(
        { error: TestSuiteMessages.FailedToCheckTestCasesInSuite },
        { status: 500 }
      );
    }
  }

  /**
   * Get available modules and test cases for adding to suite
   */
  async getAvailableTestCases(suiteId: string) {
    try {
      const result = await testSuiteService.getAvailableTestCases(suiteId);

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error fetching available test cases:', error);
      return NextResponse.json(
        { error: 'Failed to fetch available test cases' },
        { status: 500 }
      );
    }
  }
}

export const testSuiteController = new TestSuiteController();
