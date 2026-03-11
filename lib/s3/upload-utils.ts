/**
 * S3 Client-Side Utilities
 * 
 * Functions for direct browser-to-S3 file uploads using presigned URLs.
 * These utilities handle chunked uploads, retries, and file management.
 */

export const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
export const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  fieldName?: string; // description, expectedResult, preconditions, postconditions
  entityType?: 'testcase' | 'teststep' | 'defect' | 'comment' | 'testresult' | 'unassigned';
}

export interface UploadOptions {
  file: File;
  fieldName: string;
  entityId?: string;
  projectId?: string;
  entityType?: 'testcase' | 'teststep' | 'defect' | 'comment' | 'testresult' | 'unassigned';
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  success: boolean;
  attachment?: Attachment;
  error?: string;
}

/**
 * Validates a file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a file to local storage as fallback when S3 is not configured
 */
async function uploadFileLocal(
  file: File,
  fieldName: string,
  entityType: string,
  projectId?: string,
  onProgress?: (progress: number) => void,
): Promise<UploadResult> {
  try {
    onProgress?.(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fieldName', fieldName);
    formData.append('entityType', entityType);
    if (projectId) formData.append('projectId', projectId);

    onProgress?.(30);

    const response = await fetch('/api/attachments/upload-local', {
      method: 'POST',
      body: formData,
    });

    onProgress?.(80);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload file locally');
    }

    const data = await response.json();
    onProgress?.(100);

    return {
      success: true,
      attachment: data.attachment,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Local upload failed',
    };
  }
}

/**
 * Uploads a file directly to S3 using chunked multipart upload with presigned URLs
 * Falls back to local storage if S3 is not configured
 */
export async function uploadFileToS3({
  file,
  fieldName,
  entityId,
  projectId,
  entityType = 'testcase',
  onProgress,
}: UploadOptions): Promise<UploadResult> {
  try {
    // Step 1: Initialize multipart upload and get presigned URLs
    let initResponse: Response;
    try {
      initResponse = await fetch('/api/attachments/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fieldName,
          entityType,
          entityId,
          projectId,
        }),
      });
    } catch {
      // ネットワークエラーやサーバーエラーの場合はローカルにフォールバック
      console.warn('S3 upload request failed, falling back to local storage');
      return uploadFileLocal(file, fieldName, entityType, projectId, onProgress);
    }

    if (!initResponse.ok) {
      // S3が利用できない場合はローカルストレージにフォールバック
      console.warn('S3 upload initialization failed, falling back to local storage');
      return uploadFileLocal(file, fieldName, entityType, projectId, onProgress);
    }

    const { uploadId, s3Key, presignedUrls, totalParts } = await initResponse.json();

    // Step 2: Upload each chunk directly to S3 using presigned URLs
    const uploadedParts: Array<{ PartNumber: number; ETag: string }> = [];
    let completedChunks = 0;

    for (const { partNumber, url } of presignedUrls) {
      const start = (partNumber - 1) * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      // Retry logic for failed chunks
      let retries = 3;
      let success = false;

      while (retries > 0 && !success) {
        try {
          // Upload directly to S3 via presigned URL
          // Note: Don't set Content-Type header here as it's already in the presigned URL
          const uploadResponse = await fetch(url, {
            method: 'PUT',
            body: chunk,
          });

          if (!uploadResponse.ok) {
            const errorText = await uploadResponse.text();
            console.error(`S3 upload error (status ${uploadResponse.status}):`, errorText);
            throw new Error(`Upload failed with status ${uploadResponse.status}: ${errorText}`);
          }

          // Get ETag from response headers
          const etag = uploadResponse.headers.get('ETag');
          if (!etag) {
            throw new Error(
              `No ETag received from S3. This is a CORS issue.\n\n` +
              `Your S3 bucket CORS configuration is missing "ETag" in ExposeHeaders.\n\n` +
              `Add this origin to your S3 CORS settings:\n${window.location.origin}\n\n` +
              `Make sure ExposeHeaders includes: ["ETag", "Content-Length"]\n\n` +
              `See docs/S3_CORS_SETUP.md for complete CORS configuration.`
            );
          }

          uploadedParts.push({ 
            PartNumber: partNumber, 
            ETag: etag.replace(/"/g, '') 
          });
          completedChunks++;
          success = true;

          // Update progress
          const progress = Math.round((completedChunks / totalParts) * 100);
          onProgress?.(progress);
        } catch (error) {
          console.error(`Chunk ${partNumber} upload attempt failed:`, error);
          retries--;
          if (retries === 0) {
            // Abort upload on final failure
            await abortUpload(uploadId, s3Key).catch(() => {});
            
            // Check if it's a CORS error
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            if (errorMessage.includes('Failed to fetch') || 
                errorMessage.includes('NetworkError') || 
                errorMessage.includes('No ETag received') ||
                errorMessage.includes('CORS')) {
              throw new Error(
                `CORS Error: Cannot upload to S3. Your S3 bucket needs CORS configuration.\n\n` +
                `Add this origin to your S3 bucket CORS settings:\n${window.location.origin}\n\n` +
                `Required CORS configuration:\n` +
                `- AllowedOrigins: ["${window.location.origin}"]\n` +
                `- AllowedMethods: ["GET", "PUT", "DELETE", "HEAD"]\n` +
                `- AllowedHeaders: ["*"]\n` +
                `- ExposeHeaders: ["ETag", "Content-Length"]\n\n` +
                `See docs/S3_CORS_SETUP.md for complete instructions.`
              );
            }
            
            throw new Error(`Failed to upload chunk ${partNumber} after 3 retries: ${errorMessage}`);
          }
          // Exponential backoff before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
        }
      }
    }

    // Step 3: Complete multipart upload
    const completeBody: Record<string, unknown> = {
      uploadId,
      s3Key,
      parts: uploadedParts,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fieldName,
    };

    // Add entity-specific ID field
    if (entityType === 'teststep') {
      completeBody.testStepId = entityId || null;
    } else {
      completeBody.testCaseId = entityId || null;
    }

    const completeResponse = await fetch('/api/attachments/upload/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completeBody),
    });

    if (!completeResponse.ok) {
      const error = await completeResponse.json();
      throw new Error(error.error || 'Failed to complete upload');
    }

    const { attachment } = await completeResponse.json();

    return {
      success: true,
      attachment,
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to upload file',
    };
  }
}

/**
 * Aborts a multipart upload
 */
export async function abortUpload(uploadId: string, s3Key: string): Promise<void> {
  try {
    const response = await fetch(
      `/api/attachments/upload/abort?uploadId=${uploadId}&s3Key=${encodeURIComponent(s3Key)}`,
      { method: 'DELETE' }
    );
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Failed to abort upload (status ${response.status}):`, errorText);
      // Don't throw - abort is best-effort cleanup
    }
  } catch (error) {
    console.error('Failed to abort upload (network error):', error);
    // Log but don't throw - S3 lifecycle policy will clean up incomplete uploads
  }
}

/**
 * Gets a presigned URL for downloading/previewing a file
 */
export async function getFileUrl(attachmentId: string, entityType?: string): Promise<{ url: string; isPreviewable?: boolean }> {
  let endpoint: string;
  if (entityType === 'defect') {
    endpoint = `/api/defect-attachments/${attachmentId}`;
  } else if (entityType === 'comment') {
    endpoint = `/api/comment-attachments/${attachmentId}`;
  } else {
    endpoint = `/api/attachments/${attachmentId}`;
  }
  const response = await fetch(endpoint);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Failed to get file URL (${response.status}):`, errorText);
    throw new Error(`Failed to get file URL: ${response.status} ${errorText}`);
  }
  
  const responseData = await response.json();
  
  // Handle both response formats: direct {url, isPreviewable} or nested {data: {url, isPreviewable}}
  const data = responseData.data || responseData;
  return data;
}

/**
 * Downloads or previews a file in a new tab
 */
export async function downloadFile(attachmentId: string, entityType?: string): Promise<void> {
  try {
    const { url } = await getFileUrl(attachmentId, entityType);
    window.open(url, '_blank');
  } catch (error) {
    console.error('File access error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to access file');
  }
}

/**
 * Deletes a file from S3 and database using presigned URLs
 */
export async function deleteFile(attachmentId: string, entityType?: string): Promise<void> {
  try {
    // Use different endpoint based on entity type
    let baseEndpoint: string;
    if (entityType === 'defect') {
      baseEndpoint = `/api/defect-attachments/${attachmentId}`;
    } else if (entityType === 'comment') {
      baseEndpoint = `/api/comment-attachments/${attachmentId}`;
    } else {
      baseEndpoint = `/api/attachments/${attachmentId}`;
    }
    
    // Step 1: Get presigned DELETE URL from backend
    const prepareResponse = await fetch(`${baseEndpoint}?step=prepare`, {
      method: 'DELETE',
    });

    if (!prepareResponse.ok) {
      throw new Error('Failed to prepare delete');
    }

    const { deleteUrl } = await prepareResponse.json();

    // Step 2: Delete directly from S3 using presigned URL
    const s3DeleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
    });

    if (!s3DeleteResponse.ok) {
      throw new Error('Failed to delete from S3');
    }

    // Step 3: Confirm deletion in database
    const confirmResponse = await fetch(`${baseEndpoint}?step=confirm`, {
      method: 'DELETE',
    });

    if (!confirmResponse.ok) {
      throw new Error('Failed to confirm deletion');
    }
  } catch (error) {
    console.error('Delete error:', error);
    throw new Error('Failed to delete attachment');
  }
}

/**
 * Links an attachment to an entity (test case, defect, comment, etc.)
 */
export async function linkAttachment(
  attachmentId: string,
  entityType: 'testCaseId' | 'defectId' | 'commentId' | 'testResultId',
  entityId: string
): Promise<void> {
  const response = await fetch(`/api/attachments/${attachmentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ [entityType]: entityId }),
  });

  if (!response.ok) {
    throw new Error('Failed to link attachment');
  }
}

/**
 * Links multiple attachments to an entity
 */
export async function linkAttachments(
  attachments: Attachment[],
  entityType: 'testCaseId' | 'defectId' | 'commentId' | 'testResultId',
  entityId: string
): Promise<void> {
  await Promise.all(
    attachments.map(attachment => linkAttachment(attachment.id, entityType, entityId))
  );
}

/**
 * Formats file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Gets appropriate icon component name for a file type
 */
export function getFileIconType(mimeType: string): 'image' | 'video' | 'pdf' | 'archive' | 'file' {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return 'archive';
  return 'file';
}
