/**
 * Browser-side attachment storage utility
 * Manages temporary attachment uploads before test case/result creation
 * Stores attachments in memory with S3 key references
 */

export interface BrowserAttachment {
  id: string; // Unique ID for this browser session
  file: File;
  uploadProgress: number; // 0-100
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  s3Key?: string; // The S3 key where this file is stored
  uploadId?: string; // For multipart uploads
  uploadedParts?: number[]; // Track which parts have been uploaded
  fieldName?: string; // Which field this attachment belongs to (description, expectedResult, etc.)
}

export interface AttachmentContextData {
  entityType: 'testcase' | 'testresult'; // What entity this attachment will be linked to
  entityId?: string; // Only set if linking to existing entity (for editing)
  projectId: string; // Required for folder structure
}

class AttachmentStorage {
  private attachments = new Map<string, BrowserAttachment>();
  private contextData: AttachmentContextData | null = null;

  /**
   * Initialize attachment context for a form/dialog
   * This determines the S3 folder structure
   */
  setContext(context: AttachmentContextData) {
    this.contextData = context;
  }

  /**
   * Get current context
   */
  getContext(): AttachmentContextData | null {
    return this.contextData;
  }

  /**
   * Clear context (call when dialog closes or form resets)
   */
  clearContext() {
    this.contextData = null;
  }

  /**
   * Add a file to temporary storage
   */
  addAttachment(file: File, fieldName?: string): string {
    const attachmentId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

    this.attachments.set(attachmentId, {
      id: attachmentId,
      file,
      uploadProgress: 0,
      status: 'pending',
      fieldName,
    });

    return attachmentId;
  }

  /**
   * Get a single attachment by ID
   */
  getAttachment(attachmentId: string): BrowserAttachment | undefined {
    return this.attachments.get(attachmentId);
  }

  /**
   * Get all attachments
   */
  getAllAttachments(): BrowserAttachment[] {
    return Array.from(this.attachments.values());
  }

  /**
   * Get only completed attachments (ready to associate)
   */
  getCompletedAttachments(): BrowserAttachment[] {
    return Array.from(this.attachments.values()).filter(
      (att) => att.status === 'completed' && att.s3Key
    );
  }

  /**
   * Update attachment status and progress
   */
  updateAttachmentStatus(
    attachmentId: string,
    status: BrowserAttachment['status'],
    progress?: number,
    s3Key?: string,
    error?: string,
    fieldName?: string
  ) {
    const attachment = this.attachments.get(attachmentId);
    if (attachment) {
      attachment.status = status;
      if (progress !== undefined) attachment.uploadProgress = progress;
      if (s3Key) attachment.s3Key = s3Key;
      if (error) attachment.error = error;
      if (fieldName) attachment.fieldName = fieldName;
    }
  }

  /**
   * Update upload ID for multipart uploads
   */
  setUploadId(attachmentId: string, uploadId: string) {
    const attachment = this.attachments.get(attachmentId);
    if (attachment) {
      attachment.uploadId = uploadId;
    }
  }

  /**
   * Track uploaded parts for multipart uploads
   */
  addUploadedPart(attachmentId: string, partNumber: number) {
    const attachment = this.attachments.get(attachmentId);
    if (attachment) {
      if (!attachment.uploadedParts) {
        attachment.uploadedParts = [];
      }
      attachment.uploadedParts.push(partNumber);
    }
  }

  /**
   * Remove an attachment
   */
  removeAttachment(attachmentId: string) {
    this.attachments.delete(attachmentId);
  }

  /**
   * Clear all attachments (call when test case is created/saved)
   */
  clearAllAttachments() {
    this.attachments.clear();
  }

  /**
   * Check if any attachments are still uploading
   */
  hasUploadingAttachments(): boolean {
    return Array.from(this.attachments.values()).some(
      (att) => att.status === 'uploading'
    );
  }

  /**
   * Get list of S3 keys for completed attachments
   * Use this when saving test case to link attachments
   */
  getCompletedAttachmentKeys(): { s3Key: string; fileName: string; mimeType: string; fieldName?: string }[] {
    return this.getCompletedAttachments().map((att) => ({
      s3Key: att.s3Key || '',
      fileName: att.file.name,
      mimeType: att.file.type,
      fieldName: att.fieldName,
    }));
  }

  /**
   * Check if there are pending attachments waiting to be uploaded
   * Returns true if any attachments have status 'pending'
   */
  hasPendingAttachments(): boolean {
    return Array.from(this.attachments.values()).some((att) => att.status === 'pending');
  }

  /**
   * Get list of pending attachments (ready to upload)
   * Returns all attachments with status 'pending'
   */
  getPendingAttachments(): BrowserAttachment[] {
    return Array.from(this.attachments.values()).filter((att) => att.status === 'pending');
  }
}

// Singleton instance for browser-side storage
export const attachmentStorage = new AttachmentStorage();
