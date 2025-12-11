/**
 * Hook for managing attachment uploads in forms/dialogs
 * Handles file selection, upload to S3, and progress tracking
 */

import { useState, useCallback } from 'react';
import { attachmentStorage, type BrowserAttachment } from '@/lib/attachment-storage';

export interface UseAttachmentsOptions {
  maxFileSize?: number;
  allowedMimeTypes?: string[];
}

const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
];

export function useAttachments(options: UseAttachmentsOptions = {}) {
  const maxFileSize = options.maxFileSize || 100 * 1024 * 1024; // 100MB default
  const allowedMimeTypes = options.allowedMimeTypes || DEFAULT_ALLOWED_MIME_TYPES;

  const [attachments, setAttachments] = useState<BrowserAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle file selection from input
   */
  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const newAttachments: BrowserAttachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate file size
        if (file.size > maxFileSize) {
          setError(`File "${file.name}" exceeds maximum size of ${maxFileSize / (1024 * 1024)}MB`);
          continue;
        }

        // Validate MIME type
        if (!allowedMimeTypes.includes(file.type)) {
          setError(`File type "${file.type}" is not supported`);
          continue;
        }

        // Add to storage and state
        const attachmentId = attachmentStorage.addAttachment(file);
        const attachment = attachmentStorage.getAttachment(attachmentId)!;
        newAttachments.push(attachment);

        // DON'T start upload yet - just store in browser memory
        // File will be uploaded when user clicks Save/Create button
        // uploadAttachment(attachmentId, file); // REMOVED - upload happens on save
      }

      setAttachments((prev) => [...prev, ...newAttachments]);
      if (newAttachments.length === 0 && error) {
        // Keep error message visible
        setTimeout(() => setError(null), 5000);
      }
    },
    [maxFileSize, allowedMimeTypes]
  );

  /**
   * Upload all pending attachments to S3 (called when user saves)
   * This ensures all files are uploaded only when user commits the form
   */
  const uploadAllPendingAttachments = useCallback(async (): Promise<boolean> => {
    const pendingAttachments = attachments.filter((att) => att.status === 'pending');

    if (pendingAttachments.length === 0) {
      return true; // No files to upload
    }

    for (const attachment of pendingAttachments) {
      const file = attachmentStorage.getAttachment(attachment.id)?.file;
      if (!file) {
        const errorMsg = `File not found: ${attachment.id}`;
        setError(errorMsg);
        return false;
      }

      const success = await uploadAttachment(attachment.id, file);
      if (!success) {
        return false; // Stop if any upload fails
      }
    }

    return true; // All uploads successful
  }, [attachments]);

  /**
   * Upload a file to S3
   * Returns true if successful, false if failed
   */
  const uploadAttachment = async (attachmentId: string, file: File): Promise<boolean> => {
    try {
      attachmentStorage.updateAttachmentStatus(attachmentId, 'uploading', 0);

      const context = attachmentStorage.getContext();
      if (!context) {
        throw new Error('Attachment context not set');
      }

      // Initialize multipart upload
      const initResponse = await fetch('/api/attachments/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fieldName: 'attachment',
          entityType: context.entityType,
          entityId: context.entityId,
          projectId: context.projectId,
        }),
      });

      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        throw new Error(errorData.error || 'Failed to initialize upload');
      }

      const {
        uploadId,
        s3Key,
        presignedUrls,
        totalParts,
        chunkSize,
      } = await initResponse.json();

      attachmentStorage.setUploadId(attachmentId, uploadId);
      attachmentStorage.updateAttachmentStatus(attachmentId, 'uploading', 10, s3Key);

      // Upload parts
      const partETags: { PartNumber: number; ETag: string }[] = [];

      for (const { partNumber, url } of presignedUrls) {
        const start = (partNumber - 1) * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const uploadResponse = await fetch(url, {
          method: 'PUT',
          body: chunk,
          headers: {
            'Content-Type': file.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Failed to upload part ${partNumber}`);
        }

        const etag = uploadResponse.headers.get('etag');
        if (!etag) {
          throw new Error(`Missing ETag for part ${partNumber}`);
        }

        partETags.push({
          PartNumber: partNumber,
          ETag: etag,
        });

        attachmentStorage.addUploadedPart(attachmentId, partNumber);

        // Update progress
        const progress = 10 + Math.round((partNumber / totalParts) * 80); // 10-90%
        attachmentStorage.updateAttachmentStatus(attachmentId, 'uploading', progress);

        // Update state
        setAttachments((prev) =>
          prev.map((att) =>
            att.id === attachmentId
              ? { ...att, uploadProgress: progress, status: 'uploading' }
              : att
          )
        );
      }

      // Complete multipart upload
      const completeResponse = await fetch('/api/attachments/upload/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId,
          s3Key,
          parts: partETags,
        }),
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(errorData.error || 'Failed to complete upload');
      }

      // Mark as completed
      attachmentStorage.updateAttachmentStatus(
        attachmentId,
        'completed',
        100,
        s3Key
      );

      setAttachments((prev) =>
        prev.map((att) =>
          att.id === attachmentId
            ? { ...att, uploadProgress: 100, status: 'completed', s3Key }
            : att
        )
      );

      return true; // Upload successful
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      attachmentStorage.updateAttachmentStatus(
        attachmentId,
        'error',
        0,
        undefined,
        errorMessage
      );

      setAttachments((prev) =>
        prev.map((att) =>
          att.id === attachmentId
            ? { ...att, status: 'error', error: errorMessage }
            : att
        )
      );

      setError(errorMessage);
      return false; // Upload failed
    }
  };

  /**
   * Remove an attachment
   */
  const removeAttachment = (attachmentId: string) => {
    attachmentStorage.removeAttachment(attachmentId);
    setAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
  };

  /**
   * Clear all attachments
   */
  const clearAttachments = () => {
    attachmentStorage.clearAllAttachments();
    setAttachments([]);
    setError(null);
  };

  /**
   * Check if any attachments are uploading
   */
  const isUploading = attachmentStorage.hasUploadingAttachments();

  return {
    attachments,
    error,
    isUploading,
    handleFileSelect,
    removeAttachment,
    clearAttachments,
    uploadAllPendingAttachments, // Call this when user clicks Save/Create button
    getCompletedAttachmentKeys: () => attachmentStorage.getCompletedAttachmentKeys(),
  };
}
