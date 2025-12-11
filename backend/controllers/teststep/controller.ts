import { attachmentService } from '@/backend/services/attachment/services';
import { BadRequestException, NotFoundException, InternalServerException } from '@/backend/utils/exceptions';

type RequestLike = {
  url: string;
  json: () => Promise<Record<string, unknown>>;
};

export class TestStepController {
  /**
   * Associate attachments with a test step
   */
  async associateAttachments(stepId: string, req: RequestLike) {
    try {
      const body = await req.json();
      const { attachments } = body as {
        attachments: Array<{ id?: string; s3Key?: string; fileName?: string; mimeType?: string; fieldName?: string }>;
      };

      if (!attachments || !Array.isArray(attachments)) {
        throw new BadRequestException('Attachments array is required');
      }

      const linkedAttachments = await attachmentService.associateAttachments(
        'teststep',
        stepId,
        attachments
      );

      return {
        data: { success: true, attachments: linkedAttachments },
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof Error && error.message.includes('Unsupported entity type')) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      throw new InternalServerException('Failed to associate attachments');
    }
  }

  /**
   * Get all attachments for a test step
   */
  async getTestStepAttachments(stepId: string) {
    try {
      const attachments = await attachmentService.getAttachmentsByEntity(
        'teststep',
        stepId
      );

      return {
        data: attachments,
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('not found')) {
        throw new NotFoundException(error.message);
      }
      if (error instanceof Error && error.message.includes('Unsupported entity type')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerException('Failed to fetch attachments');
    }
  }
}

export const testStepController = new TestStepController();
