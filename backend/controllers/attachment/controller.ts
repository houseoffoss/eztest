import { attachmentService } from '@/backend/services/attachment/services';
import { BadRequestException, NotFoundException, InternalServerException } from '@/backend/utils/exceptions';

type RequestLike = {
  url: string;
  json: () => Promise<Record<string, unknown>>;
};

export class AttachmentController {
  /**
   * Initialize multipart upload
   */
  async initializeUpload(req: RequestLike) {
    try {
      const body = await req.json();
      const { fileName, fileSize, fileType, entityType, entityId } = body as Record<string, unknown>;

      const result = await attachmentService.initializeUpload(
        String(fileName),
        Number(fileSize),
        String(fileType),
        entityType ? String(entityType) : undefined,
        entityId ? String(entityId) : undefined
      );

      return {
        data: result,
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('exceeds maximum')) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error && error.message.includes('not allowed')) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error && error.message.includes('not supported')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerException('Failed to initialize upload');
    }
  }

  /**
   * Complete multipart upload
   */
  async completeUpload(req: RequestLike) {
    try {
      const body = await req.json();
      const {
        uploadId,
        s3Key,
        parts,
        fileName,
        fileSize,
        fileType,
        testCaseId,
        testStepId,
      } = body as Record<string, unknown>;

      const result = await attachmentService.completeUpload(
        String(uploadId),
        String(s3Key),
        parts as { PartNumber: number; ETag: string }[],
        String(fileName),
        Number(fileSize),
        String(fileType),
        testCaseId ? String(testCaseId) : undefined,
        testStepId ? String(testStepId) : undefined
      );

      return {
        data: result,
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Invalid upload')) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error && error.message.includes('not allowed')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerException('Failed to complete upload');
    }
  }

  /**
   * Abort multipart upload
   */
  async abortUpload(req: RequestLike) {
    try {
      const url = new URL(req.url);
      const uploadId = url.searchParams.get('uploadId');
      const fileKey = url.searchParams.get('fileKey');

      const result = await attachmentService.abortUpload(uploadId || '', fileKey || '');

      return {
        data: result,
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Missing required')) {
        throw new BadRequestException(error.message);
      }
      throw new InternalServerException('Failed to abort upload');
    }
  }

  /**
   * Get attachment download URL
   */
  async getDownloadUrl(req: RequestLike, attachmentId: string) {
    try {
      const result = await attachmentService.getDownloadUrl(attachmentId);

      return {
        data: result,
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Attachment not found') {
        throw new NotFoundException('Attachment not found');
      }
      throw new InternalServerException('Failed to generate download URL');
    }
  }

  /**
   * Update attachment metadata
   */
  async updateAttachment(req: RequestLike, attachmentId: string) {
    try {
      const body = await req.json();
      const { testCaseId, testStepId } = body as Record<string, unknown>;

      const result = await attachmentService.updateAttachment(
        attachmentId,
        testCaseId ? String(testCaseId) : undefined,
        testStepId ? String(testStepId) : undefined
      );

      return {
        data: result,
        statusCode: 200,
      };
    } catch {
      throw new InternalServerException('Failed to update attachment');
    }
  }

  /**
   * Prepare attachment deletion
   */
  async prepareDelete(req: RequestLike, attachmentId: string) {
    try {
      const result = await attachmentService.prepareDelete(attachmentId);

      return {
        data: result,
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Attachment not found') {
        throw new NotFoundException('Attachment not found');
      }
      throw new InternalServerException('Failed to prepare deletion');
    }
  }

  /**
   * Confirm attachment deletion
   */
  async confirmDelete(req: RequestLike, attachmentId: string) {
    try {
      const result = await attachmentService.confirmDelete(attachmentId);

      return {
        data: result,
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Attachment not found') {
        throw new NotFoundException('Attachment not found');
      }
      throw new InternalServerException('Failed to delete attachment');
    }
  }
}

export const attachmentController = new AttachmentController();
