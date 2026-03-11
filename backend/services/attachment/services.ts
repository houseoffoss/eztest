import { prisma } from '@/lib/prisma';
import { s3Client, getS3Bucket, getS3PathPrefix, isS3Configured, MAX_FILE_SIZE, CHUNK_SIZE } from '@/lib/s3-client';
import { CreateMultipartUploadCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';

// Allowed MIME types (security whitelist)
const ALLOWED_MIME_TYPES = [
  // Images
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif',
  // Videos (restricted by entity type/path check)
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Spreadsheets
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // Presentations
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // Text files
  'text/plain', 'text/csv', 'text/html', 'text/markdown',
  // Archives
  'application/zip', 'application/x-zip-compressed',
  'application/x-rar-compressed', 'application/x-7z-compressed',
  // Code files
  'application/json', 'application/xml', 'text/javascript', 'text/css',
  // Videos
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo',
];

export class AttachmentService {
  /**
   * Validate file type against security whitelist
   */
  private validateFileType(mimeType: string, entityType?: string, s3Key?: string): boolean {
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return false;
    }

    // Only allow videos for defect/comment attachments
    if (mimeType.startsWith('video/')) {
      const allowByEntityType = entityType === 'defect' || entityType === 'comment';
      const allowByS3Path = typeof s3Key === 'string' && (s3Key.includes('/defects/') || s3Key.includes('/comments/'));
      return allowByEntityType || allowByS3Path;
    }

    return true;
  }

  /**
   * Initialize multipart upload
   */
  async initializeUpload(
    fileName: string,
    fileSize: number,
    fileType: string,
    projectId?: string,
    entityType?: string,
    entityId?: string
  ) {
    // Validate file size
    if (fileSize > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
    }

    // Validate file name
    if (!fileName || typeof fileName !== 'string') {
      throw new Error('Invalid file name');
    }

    // Validate file type (security - don't trust client)
    if (!fileType || !this.validateFileType(fileType, entityType)) {
      throw new Error(`File type "${fileType}" is not allowed`);
    }

    // Generate unique S3 key with hierarchical folder structure
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');

    // Convert entity type to plural for folder naming
    const pluralizeEntityType = (type: string): string => {
      const plurals: { [key: string]: string } = {
        'testcase': 'testcases',
        'teststep': 'teststeps',
        'defect': 'defects',
        'comment': 'comments',
        'testresult': 'testresults',
        'unassigned': 'unassigned'
      };
      return plurals[type] || type + 's';
    };

    const pluralEntityType = entityType ? pluralizeEntityType(entityType) : null;
    const pathPrefix = getS3PathPrefix();

    let s3Key: string;
    if (projectId && pluralEntityType && entityId) {
      // Entity exists (editing) - store under pathPrefix/projects/projectId/entityType/entityId
      s3Key = `${pathPrefix}/projects/${projectId}/${pluralEntityType}/${entityId}/${timestamp}-${randomHash}-${sanitizedFileName}`;
    } else if (projectId && pluralEntityType) {
      // Entity doesn't exist yet (creating) - store under pathPrefix/projects/projectId/entityType
      s3Key = `${pathPrefix}/projects/${projectId}/${pluralEntityType}/${timestamp}-${randomHash}-${sanitizedFileName}`;
    } else if (pluralEntityType && entityId) {
      // Fallback without project (backward compatibility)
      s3Key = `${pathPrefix}/${pluralEntityType}/${entityId}/${timestamp}-${randomHash}-${sanitizedFileName}`;
    } else if (pluralEntityType) {
      // Fallback without project (backward compatibility)
      s3Key = `${pathPrefix}/${pluralEntityType}/${timestamp}-${randomHash}-${sanitizedFileName}`;
    } else {
      // No entity info - fallback to unassigned
      s3Key = `${pathPrefix}/unassigned/${timestamp}-${randomHash}-${sanitizedFileName}`;
    }

    const bucket = getS3Bucket();

    // Initialize multipart upload
    const multipartUpload = await s3Client.send(
      new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: s3Key,
        ContentType: fileType,
        ServerSideEncryption: 'AES256',
        Metadata: {
          originalName: fileName,
          uploadedAt: new Date().toISOString(),
        },
      })
    );

    if (!multipartUpload.UploadId) {
      throw new Error('Failed to initialize multipart upload');
    }

    // Calculate number of parts needed
    const totalParts = Math.ceil(fileSize / CHUNK_SIZE);

    // Generate presigned URLs for each part
    const presignedUrls: { partNumber: number; url: string }[] = [];

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const { UploadPartCommand } = await import('@aws-sdk/client-s3');
      const command = new UploadPartCommand({
        Bucket: bucket,
        Key: s3Key,
        UploadId: multipartUpload.UploadId,
        PartNumber: partNumber,
      });

      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour
      presignedUrls.push({ partNumber, url });
    }

    return {
      uploadId: multipartUpload.UploadId,
      s3Key,
      presignedUrls,
      totalParts,
      chunkSize: CHUNK_SIZE,
    };
  }

  /**
   * Complete multipart upload and save attachment metadata
   */
  async completeUpload(
    uploadId: string,
    s3Key: string,
    parts: { PartNumber: number; ETag: string }[],
    fileName: string,
    fileSize: number,
    fileType: string,
    testCaseId?: string,
    testStepId?: string,
    fieldName?: string
  ) {
    if (!uploadId || !s3Key || !parts || !Array.isArray(parts)) {
      throw new Error('Missing required parameters');
    }

    // Validate file type (security - must match allowed types)
    if (!this.validateFileType(fileType, undefined, s3Key)) {
      throw new Error(`File type "${fileType}" is not allowed`);
    }

    // Validate parts array completeness
    const expectedParts = Math.ceil(fileSize / CHUNK_SIZE);
    if (parts.length !== expectedParts) {
      throw new Error(`Invalid upload: expected ${expectedParts} parts, received ${parts.length}`);
    }

    // Validate parts are sequential (1, 2, 3, ...)
    const partNumbers = parts.map((p) => p.PartNumber).sort((a, b) => a - b);
    for (let i = 0; i < partNumbers.length; i++) {
      if (partNumbers[i] !== i + 1) {
        throw new Error(`Invalid upload: missing part ${i + 1}`);
      }
    }

    // Validate all parts have ETags
    const invalidParts = parts.filter((p) => !p.ETag || !p.PartNumber);
    if (invalidParts.length > 0) {
      throw new Error('Invalid upload: some parts are missing ETag or PartNumber');
    }

    // Complete the multipart upload on S3
    const completeUploadResponse = await s3Client.send(
      new CompleteMultipartUploadCommand({
        Bucket: getS3Bucket(),
        Key: s3Key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map((part) => ({
            ETag: part.ETag,
            PartNumber: part.PartNumber,
          })),
        },
      })
    );

    // Validate S3 response
    if (!completeUploadResponse.Location && !completeUploadResponse.Key) {
      throw new Error('S3 upload completion failed: no location returned');
    }

    // Save attachment metadata to database
    // Use s3Key (the actual path in the bucket) instead of Location (full URL)
    const attachment = await (prisma.attachment.create as unknown as (args: unknown) => Promise<{id: string, filename: string, originalName: string, size: number, mimeType: string, uploadedAt: Date}>)({
      data: {
        filename: s3Key,
        originalName: fileName,
        mimeType: fileType,
        size: fileSize,
        path: s3Key, // Store the S3 key, not the full URL
        ...(testCaseId && { testCaseId }),
        ...(testStepId && { testStepId }),
        ...(fieldName && { fieldName }),
      },
    });

    return {
      success: true,
      attachment: {
        id: attachment.id,
        filename: attachment.filename,
        originalName: attachment.originalName,
        size: attachment.size,
        mimeType: attachment.mimeType,
        uploadedAt: attachment.uploadedAt.toISOString(),
      },
    };
  }

  /**
   * Abort multipart upload
   */
  async abortUpload(uploadId: string, fileKey: string) {
    if (!uploadId || !fileKey) {
      throw new Error('Missing required parameters: uploadId and fileKey');
    }

    await s3Client.send(
      new AbortMultipartUploadCommand({
        Bucket: getS3Bucket(),
        Key: fileKey,
        UploadId: uploadId,
      })
    );

    return {
      message: 'Upload aborted successfully',
    };
  }

  /**
   * Get attachment download URL with presigned access
   */
  async getDownloadUrl(attachmentId: string) {
    // Fetch attachment from database
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: {
        testCase: {
          select: {
            projectId: true,
          },
        },
      },
    });

    if (!attachment) {
      throw new Error('Attachment not found');
    }

    // Determine if file should be previewed or downloaded
    const isPreviewable =
      attachment.mimeType.startsWith('image/') ||
      attachment.mimeType === 'application/pdf';

    // Generate URL for file access
    let signedUrl: string;
    if (isS3Configured()) {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const command = new GetObjectCommand({
        Bucket: getS3Bucket(),
        Key: attachment.path,
        ResponseContentDisposition: isPreviewable
          ? 'inline'
          : `attachment; filename="${encodeURIComponent(attachment.originalName)}"`,
        ResponseContentType: attachment.mimeType,
      });
      signedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
    } else {
      signedUrl = `/api/attachments/local/${attachment.path}`;
    }

    return {
      url: signedUrl,
      isPreviewable,
      path: attachment.path,
      attachment: {
        id: attachment.id,
        originalName: attachment.originalName,
        size: attachment.size,
        mimeType: attachment.mimeType,
        uploadedAt: attachment.uploadedAt,
      },
    };
  }

  /**
   * Update attachment metadata
   */
  async updateAttachment(
    attachmentId: string,
    testCaseId?: string | null,
    testStepId?: string | null
  ) {
    const updateData: Record<string, string | null> = {};

    if (testCaseId !== undefined) {
      updateData.testCaseId = testCaseId || null;
    }
    if (testStepId !== undefined) {
      updateData.testStepId = testStepId || null;
    }

    const attachment = await prisma.attachment.update({
      where: { id: attachmentId },
      data: updateData,
    });

    return {
      message: 'Attachment updated successfully',
      attachment,
    };
  }

  /**
   * Delete attachment with two-phase confirmation
   */
  async prepareDelete(attachmentId: string) {
    // Fetch attachment from database
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new Error('Attachment not found');
    }

    // Generate presigned DELETE URL for browser to delete from S3
    if (isS3Configured()) {
      const command = new DeleteObjectCommand({
        Bucket: getS3Bucket(),
        Key: attachment.path,
      });

      const deleteUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 300,
      });

      return {
        deleteUrl,
        s3Key: attachment.filename,
        message: 'Presigned DELETE URL generated',
      };
    } else {
      // ローカルストレージ: 削除URLは不要
      return {
        deleteUrl: null,
        s3Key: attachment.filename,
        message: 'Local storage - no presigned URL needed',
      };
    }
  }

  /**
   * Confirm deletion after S3 delete
   */
  async confirmDelete(attachmentId: string) {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      throw new Error('Attachment not found');
    }

    // Delete from database
    await prisma.attachment.delete({
      where: { id: attachmentId },
    });

    // Delete from S3 (fire and forget)
    try {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: getS3Bucket(),
          Key: attachment.path,
        })
      );
    } catch (error) {
      console.error('Error deleting file from S3:', error);
      // Don't throw - file cleanup is non-critical
    }

    return {
      success: true,
      message: 'Attachment deleted successfully',
    };
  }

  /**
   * Associate attachments with an entity (testcase, teststep, etc.)
   */
  async associateAttachments(
    entityType: string,
    entityId: string,
    attachments: Array<{ id?: string; s3Key?: string; fileName?: string; mimeType?: string; fieldName?: string }>
  ) {
    if (!attachments || !Array.isArray(attachments)) {
      throw new Error('attachments array is required');
    }

    const entityField = entityType === 'testcase' ? 'testCaseId' : 
                        entityType === 'teststep' ? 'testStepId' : null;

    if (!entityField) {
      throw new Error(`Unsupported entity type: ${entityType}`);
    }

    // Link existing attachments or create new ones
    const linkedAttachments = await Promise.all(
      attachments.map(async (att) => {
        // If attachment ID is provided, check if it exists and needs updating
        if (att.id) {
          const existing = await prisma.attachment.findUnique({
            where: { id: att.id }
          });

          if (!existing) {
            throw new Error(`Attachment ${att.id} not found`);
          }

          // Verify the target entity exists before updating
          if (entityType === 'teststep') {
            const stepExists = await prisma.testStep.findUnique({
              where: { id: entityId }
            });
            if (!stepExists) {
              throw new Error(`Test step ${entityId} not found`);
            }
          } else if (entityType === 'testcase') {
            const testCaseExists = await prisma.testCase.findUnique({
              where: { id: entityId }
            });
            if (!testCaseExists) {
              throw new Error(`Test case ${entityId} not found`);
            }
          }

          // Only update if the entity or fieldName needs to change
          if (existing[entityField as keyof typeof existing] !== entityId || existing.fieldName !== att.fieldName) {
            return prisma.attachment.update({
              where: { id: att.id },
              data: {
                [entityField]: entityId,
                fieldName: att.fieldName || 'attachment',
              },
            });
          }

          // Already linked correctly, just return it
          return existing;
        }
        
        // Otherwise, create a new attachment record (legacy/fallback)
        if (!att.s3Key || !att.fileName || !att.mimeType) {
          throw new Error('s3Key, fileName, and mimeType are required for new attachments');
        }

        return (prisma.attachment.create as unknown as (args: unknown) => Promise<unknown>)({
          data: {
            filename: att.s3Key.split('/').pop() || att.fileName,
            originalName: att.fileName,
            mimeType: att.mimeType,
            size: 0,
            path: att.s3Key,
            fieldName: att.fieldName || 'attachment',
            ...(entityField === 'testCaseId' && { testCaseId: entityId }),
            ...(entityField === 'testStepId' && { testStepId: entityId }),
          },
        });
      })
    );

    return linkedAttachments;
  }

  /**
   * Get all attachments for an entity
   */
  async getAttachmentsByEntity(entityType: string, entityId: string) {
    const whereClause: Record<string, string> = {};
    
    if (entityType === 'testcase') {
      whereClause.testCaseId = entityId;
    } else if (entityType === 'teststep') {
      whereClause.testStepId = entityId;
    } else {
      throw new Error(`Unsupported entity type: ${entityType}`);
    }

    const attachments = await prisma.attachment.findMany({
      where: whereClause,
    });

    return attachments;
  }
}

export const attachmentService = new AttachmentService();
