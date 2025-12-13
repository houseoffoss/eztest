/**
 * Reusable attachment upload component
 * Can be used in any form/dialog for file uploads
 */

'use client';

import React, { useRef } from 'react';
import { Upload, X, Check, AlertCircle, Loader } from 'lucide-react';
import { useAttachments } from '@/hooks/useAttachments';
import { cn } from '@/lib/utils';
import { isAttachmentsEnabledClient } from '@/lib/attachment-config';

export interface AttachmentUploadProps {
  className?: string;
  accept?: string;
  maxFiles?: number;
  onAttachmentsChange?: (attachmentKeys: { s3Key: string; fileName: string; mimeType: string }[]) => void;
}

export function AttachmentUpload({
  className,
  accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv',
  maxFiles = 10,
  onAttachmentsChange,
}: AttachmentUploadProps) {
  // Check if attachments feature is enabled
  const attachmentsEnabled = isAttachmentsEnabledClient();
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    attachments,
    error,
    isUploading,
    handleFileSelect,
    removeAttachment,
    getCompletedAttachmentKeys,
  } = useAttachments();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files) {
      const remainingSlots = maxFiles - attachments.length;
      if (files.length > remainingSlots) {
        alert(`Maximum ${maxFiles} files allowed. ${remainingSlots} slot(s) remaining.`);
        return;
      }
      handleFileSelect(files);
      onAttachmentsChange?.(getCompletedAttachmentKeys());
      e.currentTarget.value = ''; // Reset input
    }
  };

  const handleRemove = (attachmentId: string) => {
    removeAttachment(attachmentId);
    onAttachmentsChange?.(getCompletedAttachmentKeys());
  };

  // Don't render if attachments feature is disabled
  if (!attachmentsEnabled) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Upload Button */}
      <div
        className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={isUploading || attachments.length >= maxFiles}
        />
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm font-medium text-gray-700">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-gray-500 mt-1">
          ({attachments.length}/{maxFiles} files)
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Attachments</p>
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded border border-gray-200"
            >
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {attachment.status === 'pending' && (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
                {attachment.status === 'uploading' && (
                  <Loader className="w-4 h-4 text-blue-500 animate-spin" />
                )}
                {attachment.status === 'completed' && (
                  <Check className="w-4 h-4 text-green-500" />
                )}
                {attachment.status === 'error' && (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {attachment.file.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                    <div
                      className={cn(
                        'h-1.5 rounded-full transition-all',
                        attachment.status === 'completed'
                          ? 'bg-green-500'
                          : attachment.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                      )}
                      style={{ width: `${attachment.uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {attachment.uploadProgress}%
                  </span>
                </div>
                {attachment.error && (
                  <p className="text-xs text-red-600 mt-1">{attachment.error}</p>
                )}
              </div>

              {/* Remove Button */}
              {attachment.status !== 'uploading' && (
                <button
                  onClick={() => handleRemove(attachment.id)}
                  className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
