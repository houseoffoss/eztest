import { NextRequest, NextResponse } from 'next/server';
import { TestSuiteService } from '@/backend/services/testsuite/services';
import { UserRole } from '@prisma/client';

const testSuiteService = new TestSuiteService();

export class TestSuiteController {
  /**
   * Get all test suites for a project
   */
  async getProjectTestSuites(projectId: string, userId: string) {
    try {
      const suites = await testSuiteService.getProjectTestSuites(projectId);

      return NextResponse.json({
        data: suites,
        message: 'Test suites fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching test suites:', error);
      return NextResponse.json(
        { error: 'Failed to fetch test suites' },
        { status: 500 }
      );
    }
  }

  /**
   * Get a single test suite by ID
   */
  async getTestSuiteById(suiteId: string, userId: string, userRole: UserRole) {
    try {
      // Check access
      const hasAccess = await testSuiteService.hasAccessToTestSuite(suiteId, userId);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      const suite = await testSuiteService.getTestSuiteById(suiteId);

      if (!suite) {
        return NextResponse.json(
          { error: 'Test suite not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        data: suite,
        message: 'Test suite fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching test suite:', error);
      return NextResponse.json(
        { error: 'Failed to fetch test suite' },
        { status: 500 }
      );
    }
  }

  /**
   * Create a new test suite
   */
  async createTestSuite(request: NextRequest, projectId: string, userId: string, userRole: UserRole) {
    try {
      const body = await request.json();
      const { name, description, parentId, order } = body;

      if (!name || !name.trim()) {
        return NextResponse.json(
          { error: 'Suite name is required' },
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
        message: 'Test suite created successfully',
      });
    } catch (error) {
      console.error('Error creating test suite:', error);
      return NextResponse.json(
        { error: 'Failed to create test suite' },
        { status: 500 }
      );
    }
  }

  /**
   * Update a test suite
   */
  async updateTestSuite(request: NextRequest, suiteId: string, userId: string, userRole: UserRole) {
    try {
      // Check permissions
      const canManage = await testSuiteService.canManageTestSuite(suiteId, userId);
      if (!canManage) {
        return NextResponse.json(
          { error: 'Access denied. Only project owners and admins can update test suites.' },
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
        message: 'Test suite updated successfully',
      });
    } catch (error) {
      console.error('Error updating test suite:', error);
      return NextResponse.json(
        { error: 'Failed to update test suite' },
        { status: 500 }
      );
    }
  }

  /**
   * Delete a test suite
   */
  async deleteTestSuite(suiteId: string, userId: string, userRole: UserRole) {
    try {
      // Check permissions
      const canManage = await testSuiteService.canManageTestSuite(suiteId, userId);
      if (!canManage) {
        return NextResponse.json(
          { error: 'Access denied. Only project owners and admins can delete test suites.' },
          { status: 403 }
        );
      }

      await testSuiteService.deleteTestSuite(suiteId);

      return NextResponse.json({
        message: 'Test suite deleted successfully',
      });
    } catch (error) {
      console.error('Delete test suite error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to delete test suite' },
        { status: 500 }
      );
    }
  }

  /**
   * Move test cases to a suite
   */
  async moveTestCasesToSuite(request: NextRequest, userId: string, userRole: UserRole) {
    try {
      const body = await request.json();
      const { testCaseIds, suiteId } = body;

      if (!Array.isArray(testCaseIds) || testCaseIds.length === 0) {
        return NextResponse.json(
          { error: 'Test case IDs are required' },
          { status: 400 }
        );
      }

      const result = await testSuiteService.moveTestCasesToSuite(testCaseIds, suiteId || null);

      return NextResponse.json({
        data: result,
        message: `${result.count} test case(s) moved successfully`,
      });
    } catch (error) {
      console.error('Error moving test cases:', error);
      return NextResponse.json(
        { error: 'Failed to move test cases' },
        { status: 500 }
      );
    }
  }

  /**
   * Reorder suites
   */
  async reorderSuites(request: NextRequest, userId: string, userRole: UserRole) {
    try {
      const body = await request.json();
      const { updates } = body;

      if (!Array.isArray(updates) || updates.length === 0) {
        return NextResponse.json(
          { error: 'Updates are required' },
          { status: 400 }
        );
      }

      await testSuiteService.reorderSuites(updates);

      return NextResponse.json({
        message: 'Test suites reordered successfully',
      });
    } catch (error) {
      console.error('Error reordering test suites:', error);
      return NextResponse.json(
        { error: 'Failed to reorder test suites' },
        { status: 500 }
      );
    }
  }
}

export const testSuiteController = new TestSuiteController();
