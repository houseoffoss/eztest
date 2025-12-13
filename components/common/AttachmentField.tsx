'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/elements/button';
import { ButtonDestructive } from '@/elements/button-destructive';
import { Upload, X, File, FileText, Image, Video, Archive, Download } from 'lucide-react';
import { Label } from '@/elements/label';
import { Textarea } from '@/elements/textarea';
import { InlineError } from '@/components/utils/InlineError';
import {
  type Attachment,
  validateFile,
  uploadFileToS3,
  downloadFile,
  deleteFile,
  formatFileSize,
  getFileIconType,
} from '@/lib/s3';
import { isAttachmentsEnabledClient } from '@/lib/attachment-config';

interface AttachmentFieldProps {
  label: string;
  fieldName: string; // 'preconditions' | 'postconditions' | 'description' | 'comment' | etc.
  textValue: string;
  onTextChange: (value: string) => void;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  entityId?: string; // testCaseId, defectId, commentId, etc.
  entityType?: 'testcase' | 'defect' | 'comment' | 'testresult' | 'unassigned';
  maxLength?: number;
  placeholder?: string;
  showTextArea?: boolean; // Optional: hide text area for attachment-only fields
}

export function AttachmentField({
  label,
  fieldName,
  textValue,
  onTextChange,
  attachments,
  onAttachmentsChange,
  entityId,
  entityType = 'testcase',
  maxLength = 250,
  placeholder,
  showTextArea = true,
}: AttachmentFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileError, setFileError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (mimeType: string) => {
    const iconType = getFileIconType(mimeType);
    const iconClass = "w-4 h-4";
    // eslint-disable-next-line jsx-a11y/alt-text
    if (iconType === 'image') return <Image className={iconClass} />;
    if (iconType === 'video') return <Video className={iconClass} />;
    if (iconType === 'pdf') return <FileText className={iconClass} />;
    if (iconType === 'archive') return <Archive className={iconClass} />;
    return <File className={iconClass} />;
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    setFileError('');

    const result = await uploadFileToS3({
      file,
      fieldName,
      entityId,
      entityType,
      onProgress: (progress) => setUploadProgress(progress),
    });

    if (result.success && result.attachment) {
      onAttachmentsChange([...attachments, result.attachment]);
      setUploadProgress(100);
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    } else {
      setFileError(result.error || 'Failed to upload file');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileError('');

    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      setFileError(validation.error || 'Invalid file');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    await handleUpload(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownload = async (attachmentId: string) => {
    try {
      await downloadFile(attachmentId);
    } catch (error) {
      console.error('File access error:', error);
      setFileError('Failed to access file');
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm('Are you sure you want to delete this attachment?')) return;

    try {
      await deleteFile(attachmentId);
      onAttachmentsChange(attachments.filter((a) => a.id !== attachmentId));
    } catch (error) {
      console.error('Delete error:', error);
      setFileError('Failed to delete attachment');
    }
  };

  // Check if attachments feature is enabled
  const attachmentsEnabled = isAttachmentsEnabledClient();

  return (
    <div className="space-y-3">
      <Label htmlFor={fieldName}>{label}</Label>

      {/* Text Input - Optional */}
      {showTextArea && (
        <Textarea
          id={fieldName}
          variant="glass"
          value={textValue}
          onChange={(e) => onTextChange(e.target.value)}
          rows={3}
          maxLength={maxLength}
          placeholder={placeholder}
        />
      )}

      {/* Upload Button */}
      {attachmentsEnabled && (
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.zip,.rar"
        />
        <Button
          type="button"
          size="sm"
          variant="glass"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? `Uploading ${uploadProgress}%` : 'Attach File'}
        </Button>
        {uploading && (
          <div className="flex-1 max-w-xs">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
      )}

      {/* Inline Error */}
      {attachmentsEnabled && fileError && (
        <InlineError 
          message={fileError} 
          onClose={() => setFileError('')} 
        />
      )}

      {/* Attachments List */}
      {attachmentsEnabled && attachments.length > 0 && (
        <div className="space-y-2 mt-3">
          <p className="text-sm text-white/60">Attachments ({attachments.length})</p>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="text-white/60">
                    {getFileIcon(attachment.mimeType)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/90 truncate">
                      {attachment.originalName}
                    </p>
                    <p className="text-xs text-white/50">
                      {formatFileSize(attachment.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(attachment.id)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <ButtonDestructive
                    size="sm"
                    onClick={() => handleDelete(attachment.id)}
                  >
                    <X className="w-4 h-4" />
                  </ButtonDestructive>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {attachmentsEnabled && (
        <p className="text-xs text-white/40">
          Maximum file size: 500MB. All file formats supported.
        </p>
      )}
    </div>
  );
}
