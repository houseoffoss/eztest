import { testCaseService } from '@/backend/services/testcase/services';
import { CustomRequest } from '@/backend/utils/interceptor';
import { NotFoundException, InternalServerException, ValidationException } from '@/backend/utils/exceptions';
import { TestCaseMessages } from '@/backend/constants/static_messages';
import { createTestCaseSchema, updateTestCaseSchema, updateTestStepsSchema, testCaseQuerySchema } from '@/backend/validators';
import { z } from 'zod';

export class TestCaseController {
  /**
   * Get all test cases for a project
   * Access already checked by route wrapper
   */
  async getProjectTestCases(
    req: CustomRequest,
    projectId: string
  ) {
    const searchParams = req.nextUrl.searchParams;
    const queryData = {
      suiteId: searchParams.get('suiteId') || undefined,
      priority: searchParams.get('priority') || undefined,
      status: searchParams.get('status') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // Validation with Zod
    const validationResult = testCaseQuerySchema.safeParse(queryData);
    if (!validationResult.success) {
      throw new ValidationException(
        'Invalid query parameters',
        validationResult.error.issues
      );
    }

    const filters = validationResult.data;

    const testCases = await testCaseService.getProjectTestCases(
      projectId,
      filters
    );

    return { data: testCases };
  }

  /**
   * Create a new test case
   * Permission already checked by route wrapper
   */
  async createTestCase(
    req: CustomRequest,
    projectId: string
  ) {
    const body = await req.json();

    // Validation with Zod
    const validationResult = createTestCaseSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Test case validation failed:', {
        body,
        errors: validationResult.error.issues
      });
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;

    const testCase = await testCaseService.createTestCase({
      projectId,
      moduleId: validatedData.moduleId ?? undefined,
      suiteId: validatedData.suiteId ?? undefined,
      title: validatedData.title,
      description: validatedData.description,
      expectedResult: validatedData.expectedResult,
      priority: validatedData.priority,
      status: validatedData.status,
      estimatedTime: validatedData.estimatedTime,
      preconditions: validatedData.preconditions,
      postconditions: validatedData.postconditions,
      createdById: req.userInfo.id,
      steps: validatedData.steps,
    });

    return { data: testCase, statusCode: 201 };
  }

  /**
   * Get test case by ID
   * Access already checked by route wrapper
   */
  async getTestCaseById(
    request: CustomRequest,
    testCaseId: string
  ) {
    try {
      const testCase = await testCaseService.getTestCaseById(
        testCaseId,
        request.userInfo.id,
        request.scopeInfo.scope_name
      );
      return { data: testCase };
    } catch (error) {
      if (error instanceof Error && error.message === 'Test case not found') {
        throw new NotFoundException(TestCaseMessages.TestCaseNotFound);
      }
      throw new InternalServerException(TestCaseMessages.FailedToFetchTestCase);
    }
  }

  /**
   * Update test case
   * Permission already checked by route wrapper
   */
  async updateTestCase(
    request: CustomRequest,
    testCaseId: string
  ) {
    const body = await request.json();

    // Validation with Zod
    const validationResult = updateTestCaseSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const validatedData = validationResult.data;

    try {
      const testCase = await testCaseService.updateTestCase(
        testCaseId,
        request.userInfo.id,
        request.scopeInfo.scope_name,
        {
          title: validatedData.title,
          description: validatedData.description,
          expectedResult: validatedData.expectedResult,
          priority: validatedData.priority,
          status: validatedData.status,
          estimatedTime: validatedData.estimatedTime,
          preconditions: validatedData.preconditions,
          postconditions: validatedData.postconditions,
          suiteId: validatedData.suiteId,
          moduleId: validatedData.moduleId,
        }
      );

      return { data: testCase };
    } catch (error) {
      if (error instanceof Error && error.message === 'Test case not found') {
        throw new NotFoundException(TestCaseMessages.TestCaseNotFound);
      }
      throw new InternalServerException(TestCaseMessages.FailedToUpdateTestCase);
    }
  }

  /**
   * Delete test case
   * Permission already checked by route wrapper
   */
  async deleteTestCase(
    request: CustomRequest,
    testCaseId: string
  ) {
    try {
      await testCaseService.deleteTestCase(
        testCaseId,
        request.userInfo.id,
        request.scopeInfo.scope_name
      );
      return { message: TestCaseMessages.TestCaseDeletedSuccessfully };
    } catch (error) {
      if (error instanceof Error && error.message === 'Test case not found') {
        throw new NotFoundException(TestCaseMessages.TestCaseNotFound);
      }
      throw new InternalServerException(TestCaseMessages.FailedToDeleteTestCase);
    }
  }

  /**
   * Update test steps
   * Permission already checked by route wrapper
   */
  async updateTestSteps(
    request: CustomRequest,
    testCaseId: string
  ) {
    const body = await request.json();

    // Validation with Zod
    const validationResult = updateTestStepsSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const { steps } = validationResult.data;

    try {
      const testCase = await testCaseService.updateTestSteps(
        testCaseId,
        request.userInfo.id,
        request.scopeInfo.scope_name,
        steps as unknown as Array<{ id?: string; stepNumber: number; action: string; expectedResult: string }>
      );
      return { data: testCase };
    } catch (error) {
      if (error instanceof Error && error.message === 'Test case not found') {
        throw new NotFoundException(TestCaseMessages.TestCaseNotFound);
      }
      throw new InternalServerException(TestCaseMessages.FailedToUpdateTestSteps);
    }
  }

  /**
   * Get test case history
   * Permission already checked by route wrapper
   */
  async getTestCaseHistory(
    request: CustomRequest,
    testCaseId: string
  ) {
    try {
      const history = await testCaseService.getTestCaseHistory(
        testCaseId,
        request.userInfo.id,
        request.scopeInfo.scope_name
      );
      return { data: history };
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(TestCaseMessages.TestCaseNotFound);
      }
      throw new InternalServerException(TestCaseMessages.FailedToFetchTestCase);
    }
  }

  /**
   * Get test case statistics for a project
   */
  async getProjectTestCaseStats(projectId: string) {
    const stats = await testCaseService.getProjectTestCaseStats(projectId);
    return { data: stats };
  }

  /**
   * Add test case to a module
   * Access already checked by route wrapper
   */
  async addTestCaseToModule(req: CustomRequest, projectId: string, tcId: string) {
    const body = await req.json();

    // Validate moduleId
    const schema = z.object({
      moduleId: z.string().min(1, 'Module ID is required'),
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      throw new ValidationException('Validation failed', validation.error.issues);
    }

    const { moduleId } = validation.data;

    try {
      const updatedTestCase = await testCaseService.addTestCaseToModule(
        projectId,
        tcId,
        moduleId
      );

      return { data: updatedTestCase };
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      if (error instanceof Error && error.message === 'Test case not found') {
        throw new NotFoundException('Test case not found');
      }
      if (error instanceof Error && error.message === 'Module not found') {
        throw new NotFoundException('Module not found');
      }
      throw new InternalServerException('Failed to add test case to module');
    }
  }

  /**
   * Remove test case from its module
   * Access already checked by route wrapper
   */
  async removeTestCaseFromModule(req: CustomRequest, projectId: string, tcId: string) {
    try {
      const updatedTestCase = await testCaseService.removeTestCaseFromModule(
        projectId,
        tcId
      );

      return { data: updatedTestCase };
    } catch (error) {
      if (error instanceof Error && error.message === 'Test case not found') {
        throw new NotFoundException('Test case not found');
      }
      throw new InternalServerException('Failed to remove test case from module');
    }
  }

  /**
   * Get defects linked to a test case
   * Permission already checked by route wrapper
   */
  async getTestCaseDefects(req: CustomRequest, testCaseId: string) {
    try {
      const defects = await testCaseService.getTestCaseDefects(testCaseId);
      return { data: defects };
    } catch (error) {
      if (error instanceof Error && error.message === 'Test case not found') {
        throw new NotFoundException('Test case not found');
      }
      throw new InternalServerException('Failed to get test case defects');
    }
  }

  /**
   * Link defects to a test case
   * Permission already checked by route wrapper
   */
  async linkDefectsToTestCase(
    req: CustomRequest,
    testCaseId: string,
    body: unknown
  ) {
    try {
      const result = await testCaseService.linkDefectsToTestCase(testCaseId, body);
      return {
        data: result,
        statusCode: 201,
      };
    } catch (error) {
      if (error instanceof ValidationException) {
        throw error;
      }
      if (error instanceof Error && error.message === 'Test case not found') {
        throw new NotFoundException('Test case not found');
      }
      throw new InternalServerException('Failed to link defects to test case');
    }
  }
}

export const testCaseController = new TestCaseController();
