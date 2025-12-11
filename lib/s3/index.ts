/**
 * S3 Utilities
 * 
 * Central export for all S3-related client-side utilities.
 * Import from this file for cleaner imports throughout the app.
 * 
 * @example
 * ```typescript
 * import { uploadFileToS3, deleteFile, type Attachment } from '@/lib/s3';
 * ```
 */

export {
  // Types
  type Attachment,
  type UploadOptions,
  type UploadResult,
  
  // Constants
  MAX_FILE_SIZE,
  CHUNK_SIZE,
  
  // Validation
  validateFile,
  
  // Upload
  uploadFileToS3,
  abortUpload,
  
  // Download/Preview
  getFileUrl,
  downloadFile,
  
  // Delete
  deleteFile,
  
  // Linking
  linkAttachment,
  linkAttachments,
  
  // Utilities
  formatFileSize,
  getFileIconType,
} from './upload-utils';
