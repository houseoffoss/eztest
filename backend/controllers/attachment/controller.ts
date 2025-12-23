import { attachmentService } from '@/backend/services/attachment/services';
import { BadRequestException, NotFoundException, InternalServerException } from '@/backend/utils/exceptions';
import { initializeUploadSchema, completeUploadSchema, abortUploadSchema } from '@/backend/validators/attachment.validator';
import { ZodError } from 'zod';

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
      
      // Validate request body
      const validatedData = initializeUploadSchema.parse(body);

      const result = await attachmentService.initializeUpload(
        validatedData.fileName,
        validatedData.fileSize,
        validatedData.fileType,
        validatedData.projectId,
        validatedData.entityType,
        validatedData.entityId
      );

      return {
        data: result,
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues?.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation failed';
        throw new BadRequestException(errorMessages);
      }
      if (error instanceof Error && error.message.includes('Missing AWS configuration')) {
        throw new InternalServerException(error.message);
      }
      if (error instanceof Error && error.message.includes('exceeds maximum')) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error && error.message.includes('not allowed')) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error && error.message.includes('not supported')) {
        throw new BadRequestException(error.message);
      }
      if (error instanceof Error) {
        console.error('Upload initialization error:', error.message);
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
      
      // Validate request body
      const validatedData = completeUploadSchema.parse(body);

      const result = await attachmentService.completeUpload(
        validatedData.uploadId,
        validatedData.s3Key,
        validatedData.parts,
        validatedData.fileName,
        validatedData.fileSize,
        validatedData.fileType,
        validatedData.testCaseId ?? undefined,
        validatedData.testStepId ?? undefined
      );

      return {
        data: result,
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues?.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ') || 'Validation failed';
        throw new BadRequestException(errorMessages);
      }
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

      // Validate query parameters
      const validatedData = abortUploadSchema.parse({ uploadId, fileKey });

      const result = await attachmentService.abortUpload(validatedData.uploadId, validatedData.fileKey);

      return {
        data: result,
        statusCode: 200,
      };
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const firstError = error.issues?.[0];
        const message = firstError?.message || 'Validation failed';
        throw new BadRequestException(message);
      }
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
