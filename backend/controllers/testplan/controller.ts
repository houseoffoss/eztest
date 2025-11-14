import { NextRequest, NextResponse } from 'next/server';
import { TestPlanService } from '@/backend/services/testplan/services';
import { UserRole } from '@prisma/client';

const testPlanService = new TestPlanService();

export class TestPlanController {
  /**
   * Get all test plans for a project
   */
  async getProjectTestPlans(projectId: string, userId: string) {
    try {
      const testPlans = await testPlanService.getProjectTestPlans(projectId);

      return NextResponse.json({
        data: testPlans,
        message: 'Test plans fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching test plans:', error);
      return NextResponse.json(
        { error: 'Failed to fetch test plans' },
        { status: 500 }
      );
    }
  }

  /**
   * Get a single test plan by ID
   */
  async getTestPlanById(testPlanId: string, userId: string, userRole: UserRole) {
    try {
      // Check access
      const hasAccess = await testPlanService.hasAccessToTestPlan(testPlanId, userId);
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      const testPlan = await testPlanService.getTestPlanById(testPlanId);

      if (!testPlan) {
        return NextResponse.json(
          { error: 'Test plan not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        data: testPlan,
        message: 'Test plan fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching test plan:', error);
      return NextResponse.json(
        { error: 'Failed to fetch test plan' },
        { status: 500 }
      );
    }
  }

  /**
   * Create a new test plan
   */
  async createTestPlan(request: NextRequest, projectId: string, userId: string, userRole: UserRole) {
    try {
      const body = await request.json();
      const { name, description, testCaseIds } = body;

      if (!name || !name.trim()) {
        return NextResponse.json(
          { error: 'Test plan name is required' },
          { status: 400 }
        );
      }

      const testPlan = await testPlanService.createTestPlan({
        projectId,
        name: name.trim(),
        description: description?.trim(),
        createdById: userId,
        testCaseIds,
      });

      return NextResponse.json({
        data: testPlan,
        message: 'Test plan created successfully',
      });
    } catch (error) {
      console.error('Error creating test plan:', error);
      return NextResponse.json(
        { error: 'Failed to create test plan' },
        { status: 500 }
      );
    }
  }

  /**
   * Update a test plan
   */
  async updateTestPlan(request: NextRequest, testPlanId: string, userId: string, userRole: UserRole) {
    try {
      // Check permissions
      const canManage = await testPlanService.canManageTestPlan(testPlanId, userId);
      if (!canManage) {
        return NextResponse.json(
          { error: 'Access denied. Only project owners and admins can update test plans.' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { name, description } = body;

      const testPlan = await testPlanService.updateTestPlan(testPlanId, {
        name: name?.trim(),
        description: description?.trim(),
      });

      return NextResponse.json({
        data: testPlan,
        message: 'Test plan updated successfully',
      });
    } catch (error) {
      console.error('Error updating test plan:', error);
      return NextResponse.json(
        { error: 'Failed to update test plan' },
        { status: 500 }
      );
    }
  }

  /**
   * Delete a test plan
   */
  async deleteTestPlan(testPlanId: string, userId: string, userRole: UserRole) {
    try {
      // Check permissions
      const canManage = await testPlanService.canManageTestPlan(testPlanId, userId);
      if (!canManage) {
        return NextResponse.json(
          { error: 'Access denied. Only project owners and admins can delete test plans.' },
          { status: 403 }
        );
      }

      await testPlanService.deleteTestPlan(testPlanId);

      return NextResponse.json({
        message: 'Test plan deleted successfully',
      });
    } catch (error) {
      console.error('Delete test plan error:', error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to delete test plan' },
        { status: 500 }
      );
    }
  }

  /**
   * Add test cases to a test plan
   */
  async addTestCasesToPlan(request: NextRequest, testPlanId: string, userId: string, userRole: UserRole) {
    try {
      // Check permissions
      const canManage = await testPlanService.canManageTestPlan(testPlanId, userId);
      if (!canManage) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { testCaseIds } = body;

      if (!Array.isArray(testCaseIds) || testCaseIds.length === 0) {
        return NextResponse.json(
          { error: 'Test case IDs are required' },
          { status: 400 }
        );
      }

      const result = await testPlanService.addTestCasesToPlan(testPlanId, testCaseIds);

      return NextResponse.json({
        data: result,
        message: `${result.count} test case(s) added successfully`,
      });
    } catch (error) {
      console.error('Error adding test cases:', error);
      return NextResponse.json(
        { error: 'Failed to add test cases' },
        { status: 500 }
      );
    }
  }

  /**
   * Remove test cases from a test plan
   */
  async removeTestCasesFromPlan(request: NextRequest, testPlanId: string, userId: string, userRole: UserRole) {
    try {
      // Check permissions
      const canManage = await testPlanService.canManageTestPlan(testPlanId, userId);
      if (!canManage) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      const body = await request.json();
      const { testCaseIds } = body;

      if (!Array.isArray(testCaseIds) || testCaseIds.length === 0) {
        return NextResponse.json(
          { error: 'Test case IDs are required' },
          { status: 400 }
        );
      }

      const result = await testPlanService.removeTestCasesFromPlan(testPlanId, testCaseIds);

      return NextResponse.json({
        data: result,
        message: `${result.count} test case(s) removed successfully`,
      });
    } catch (error) {
      console.error('Error removing test cases:', error);
      return NextResponse.json(
        { error: 'Failed to remove test cases' },
        { status: 500 }
      );
    }
  }
}

export const testPlanController = new TestPlanController();
