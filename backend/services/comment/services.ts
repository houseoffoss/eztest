import { prisma } from '@/lib/prisma';
import { s3Client, S3_BUCKET } from '@/lib/s3-client';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

export class CommentService {
  /**
   * Create comment attachment
   */
  async createCommentAttachment(
    commentId: string,
    attachmentData: {
      filename: string;
      originalName: string;
      mimeType: string;
      size: number;
      path: string;
      fieldName: string;
    },
    uploadedById: string
  ) {
    const attachment = await prisma.commentAttachment.create({
      data: {
        commentId,
        filename: attachmentData.filename,
        originalName: attachmentData.originalName,
        mimeType: attachmentData.mimeType,
        size: attachmentData.size,
        path: attachmentData.path,
        fieldName: attachmentData.fieldName,
        uploadedById,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return attachment;
  }

  /**
   * Get comment attachments
   */
  async getCommentAttachments(commentId: string) {
    const attachments = await prisma.commentAttachment.findMany({
      where: { commentId },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { uploadedAt: 'asc' },
    });

    return attachments;
  }

  /**
   * Get comment attachment by ID
   */
  async getCommentAttachmentById(attachmentId: string) {
    const attachment = await prisma.commentAttachment.findUnique({
      where: { id: attachmentId },
    });

    return attachment;
  }

  /**
   * Get comment attachment download URL
   */
  async getCommentAttachmentDownloadUrl(attachmentId: string) {
    const attachment = await prisma.commentAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new Error('Comment attachment not found');
    }

    // Generate presigned URL for S3
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: attachment.path,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
      url: signedUrl,
      filename: attachment.filename,
      originalName: attachment.originalName,
      mimeType: attachment.mimeType,
      size: attachment.size,
    };
  }

  /**
   * Delete comment attachment
   */
  async deleteCommentAttachment(attachmentId: string, step: string | null) {
    const attachment = await prisma.commentAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new Error('Comment attachment not found');
    }

    if (step === 'prepare') {
      // Step 1: Generate presigned DELETE URL for S3
      const command = new DeleteObjectCommand({
        Bucket: S3_BUCKET,
        Key: attachment.path,
      });

      const deleteUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

      return { deleteUrl };
    } else if (step === 'confirm') {
      // Step 2: Remove from database after S3 deletion
      await prisma.commentAttachment.delete({
        where: { id: attachmentId },
      });

      return { success: true };
    } else {
      throw new Error('Invalid step parameter. Use step=prepare or step=confirm');
    }
  }
}

export const commentService = new CommentService();
