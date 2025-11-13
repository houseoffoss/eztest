import { testCaseService } from '@/backend/services/testcase/services';
import { Priority, TestStatus, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export class TestCaseController {
  /**
   * Get all test cases for a project
   */
  async getProjectTestCases(
    req: NextRequest,
    projectId: string
  ) {
    try {
      const searchParams = req.nextUrl.searchParams;
      const suiteId = searchParams.get('suiteId') || undefined;
      const priority = searchParams.get('priority') as Priority | undefined;
      const status = searchParams.get('status') as TestStatus | undefined;
      const search = searchParams.get('search') || undefined;

      const filters = {
        suiteId,
        priority,
        status,
        search,
      };

      const testCases = await testCaseService.getProjectTestCases(
        projectId,
        filters
      );

      return NextResponse.json({ data: testCases });
    } catch (error) {
      console.error('Error fetching test cases:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch test cases' },
        { status: 500 }
      );
    }
  }

  /**
   * Create a new test case
   */
  async createTestCase(
    req: NextRequest,
    projectId: string,
    userId: string
  ) {
    try {
      const body = await req.json();

      // Validation
      if (!body.title || body.title.trim() === '') {
        return NextResponse.json(
          { error: 'Title is required' },
          { status: 400 }
        );
      }

      // Validate priority if provided
      if (body.priority && !['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(body.priority)) {
        return NextResponse.json(
          { error: 'Invalid priority value' },
          { status: 400 }
        );
      }

      // Validate status if provided
      if (body.status && !['ACTIVE', 'DEPRECATED', 'DRAFT'].includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        );
      }

      // Validate estimated time if provided
      if (body.estimatedTime && (isNaN(body.estimatedTime) || body.estimatedTime < 0)) {
        return NextResponse.json(
          { error: 'Estimated time must be a positive number' },
          { status: 400 }
        );
      }

      // Validate steps if provided
      if (body.steps && Array.isArray(body.steps)) {
        for (const step of body.steps) {
          if (!step.action || !step.expectedResult) {
            return NextResponse.json(
              { error: 'Each step must have an action and expected result' },
              { status: 400 }
            );
          }
          if (typeof step.stepNumber !== 'number' || step.stepNumber < 1) {
            return NextResponse.json(
              { error: 'Step numbers must be positive integers' },
              { status: 400 }
            );
          }
        }
      }

      const testCase = await testCaseService.createTestCase({
        projectId,
        suiteId: body.suiteId,
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: body.status,
        estimatedTime: body.estimatedTime,
        preconditions: body.preconditions,
        postconditions: body.postconditions,
        createdById: userId,
        steps: body.steps,
      });

      return NextResponse.json({ data: testCase }, { status: 201 });
    } catch (error) {
      console.error('Error creating test case:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to create test case' },
        { status: 500 }
      );
    }
  }

  /**
   * Get test case by ID
   */
  async getTestCaseById(
    testCaseId: string,
    userId: string,
    userRole: UserRole
  ) {
    try {
      // Check access
      const hasAccess = await testCaseService.hasTestCaseAccess(testCaseId, userId, userRole);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      const testCase = await testCaseService.getTestCaseById(testCaseId);
      return NextResponse.json({ data: testCase });
    } catch (error) {
      console.error('Error fetching test case:', error);
      
      if (error instanceof Error && error.message === 'Test case not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch test case' },
        { status: 500 }
      );
    }
  }

  /**
   * Update test case
   */
  async updateTestCase(
    testCaseId: string,
    req: NextRequest,
    userId: string,
    userRole: UserRole
  ) {
    try {
      // Check permissions
      const canModify = await testCaseService.canModifyTestCase(testCaseId, userId, userRole);
      if (!canModify) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        );
      }

      const body = await req.json();

      // Validation
      if (body.title !== undefined && body.title.trim() === '') {
        return NextResponse.json(
          { error: 'Title cannot be empty' },
          { status: 400 }
        );
      }

      // Validate priority if provided
      if (body.priority && !['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(body.priority)) {
        return NextResponse.json(
          { error: 'Invalid priority value' },
          { status: 400 }
        );
      }

      // Validate status if provided
      if (body.status && !['ACTIVE', 'DEPRECATED', 'DRAFT'].includes(body.status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        );
      }

      // Validate estimated time if provided
      if (body.estimatedTime !== undefined && (isNaN(body.estimatedTime) || body.estimatedTime < 0)) {
        return NextResponse.json(
          { error: 'Estimated time must be a positive number' },
          { status: 400 }
        );
      }

      const testCase = await testCaseService.updateTestCase(testCaseId, {
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: body.status,
        estimatedTime: body.estimatedTime,
        preconditions: body.preconditions,
        postconditions: body.postconditions,
        suiteId: body.suiteId,
      });

      return NextResponse.json({ data: testCase });
    } catch (error) {
      console.error('Error updating test case:', error);
      
      if (error instanceof Error && error.message === 'Test case not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to update test case' },
        { status: 500 }
      );
    }
  }

  /**
   * Delete test case
   */
  async deleteTestCase(
    testCaseId: string,
    userId: string,
    userRole: UserRole
  ) {
    try {
      // Check permissions
      const canModify = await testCaseService.canModifyTestCase(testCaseId, userId, userRole);
      if (!canModify) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        );
      }

      await testCaseService.deleteTestCase(testCaseId);
      return NextResponse.json({ message: 'Test case deleted successfully' });
    } catch (error) {
      console.error('Error deleting test case:', error);
      
      if (error instanceof Error && error.message === 'Test case not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to delete test case' },
        { status: 500 }
      );
    }
  }

  /**
   * Update test steps
   */
  async updateTestSteps(
    testCaseId: string,
    req: NextRequest,
    userId: string,
    userRole: UserRole
  ) {
    try {
      // Check permissions
      const canModify = await testCaseService.canModifyTestCase(testCaseId, userId, userRole);
      if (!canModify) {
        return NextResponse.json(
          { error: 'Permission denied' },
          { status: 403 }
        );
      }

      const body = await req.json();

      // Validation
      if (!Array.isArray(body.steps)) {
        return NextResponse.json(
          { error: 'Steps must be an array' },
          { status: 400 }
        );
      }

      for (const step of body.steps) {
        if (!step.action || !step.expectedResult) {
          return NextResponse.json(
            { error: 'Each step must have an action and expected result' },
            { status: 400 }
          );
        }
        if (typeof step.stepNumber !== 'number' || step.stepNumber < 1) {
          return NextResponse.json(
            { error: 'Step numbers must be positive integers' },
            { status: 400 }
          );
        }
      }

      const testCase = await testCaseService.updateTestSteps(testCaseId, body.steps);
      return NextResponse.json({ data: testCase });
    } catch (error) {
      console.error('Error updating test steps:', error);
      
      if (error instanceof Error && error.message === 'Test case not found') {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to update test steps' },
        { status: 500 }
      );
    }
  }

  /**
   * Get test case statistics for a project
   */
  async getProjectTestCaseStats(projectId: string) {
    try {
      const stats = await testCaseService.getProjectTestCaseStats(projectId);
      return NextResponse.json({ data: stats });
    } catch (error) {
      console.error('Error fetching test case stats:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to fetch test case statistics' },
        { status: 500 }
      );
    }
  }
}

export const testCaseController = new TestCaseController();
