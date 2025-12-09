import { testCaseDefectService } from '@/backend/services/defect/testcasedefect/service';
import { linkDefectsSchema } from '@/backend/validators/testcase/defects';
import { CustomRequest } from '@/backend/utils/interceptor';
import { ValidationException } from '@/backend/utils/exceptions';
import { DefectMessages } from '@/backend/constants/static_messages';

export class TestCaseDefectController {
  /**
   * Get all defects linked to a test case
   */
  async getTestCaseDefects(req: CustomRequest, testCaseId: string) {
    const defects = await testCaseDefectService.getTestCaseDefects(testCaseId);
    return { data: defects };
  }

  /**
   * Link defects to a test case
   */
  async linkDefectsToTestCase(req: CustomRequest, testCaseId: string, body: unknown) {
    const validationResult = linkDefectsSchema.safeParse(body);
    if (!validationResult.success) {
      throw new ValidationException(
        'Validation failed',
        validationResult.error.issues
      );
    }

    const { defectIds } = validationResult.data;

    const result = await testCaseDefectService.linkDefectsToTestCase(
      testCaseId,
      defectIds
    );

    return {
      data: result,
      statusCode: 200,
      message: `Successfully linked ${result.linked} defect(s)`,
    };
  }

  /**
   * Unlink a defect from a test case
   */
  async unlinkDefectFromTestCase(req: CustomRequest, testCaseId: string, defectId: string) {
    await testCaseDefectService.unlinkDefectFromTestCase(testCaseId, defectId);
    return {
      data: null,
      message: DefectMessages.DefectUnlinkedSuccessfully,
    };
  }
}

export const testCaseDefectController = new TestCaseDefectController();
