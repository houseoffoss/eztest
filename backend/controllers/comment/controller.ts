import { commentService } from '@/backend/services/comment/services';
import { CustomRequest } from '@/backend/utils/interceptor';
import { ValidationException } from '@/backend/utils/exceptions';

export class CommentController {
  /**
   * Create comment attachment
   */
  async createCommentAttachment(req: CustomRequest, commentId: string, body: unknown) {
    if (!body || typeof body !== 'object') {
      throw new ValidationException('Request body is required');
    }

    const { filename, originalName, mimeType, size, path, fieldName } = body as {
      filename: string;
      originalName: string;
      mimeType: string;
      size: number;
      path: string;
      fieldName?: string;
    };

    if (!filename || !originalName || !mimeType || !size || !path) {
      throw new ValidationException('Missing required attachment fields');
    }

    const userId = req.userInfo?.id;
    if (!userId) {
      throw new ValidationException('User not authenticated');
    }

    const attachment = await commentService.createCommentAttachment(
      commentId,
      {
        filename,
        originalName,
        mimeType,
        size,
        path,
        fieldName: fieldName || 'comment',
      },
      userId
    );

    return { data: attachment };
  }

  /**
   * Get comment attachments
   */
  async getCommentAttachments(req: CustomRequest, commentId: string) {
    const attachments = await commentService.getCommentAttachments(commentId);
    return { data: attachments };
  }

  /**
   * Get comment attachment download URL
   */
  async getCommentAttachmentDownloadUrl(req: CustomRequest, attachmentId: string) {
    const attachment = await commentService.getCommentAttachmentById(attachmentId);
    
    if (!attachment) {
      throw new ValidationException('Attachment not found');
    }

    const downloadUrl = await commentService.getCommentAttachmentDownloadUrl(attachmentId);
    return { data: downloadUrl };
  }

  /**
   * Delete comment attachment
   */
  async deleteCommentAttachment(req: CustomRequest, attachmentId: string, step: string | null) {
    const attachment = await commentService.getCommentAttachmentById(attachmentId);
    
    if (!attachment) {
      throw new ValidationException('Attachment not found');
    }

    const result = await commentService.deleteCommentAttachment(attachmentId, step);
    return { data: result };
  }
}

export const commentController = new CommentController();
