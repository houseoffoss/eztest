'use client';

import { TextareaWithAttachments } from '@/frontend/reusable-elements/textareas/TextareaWithAttachments';
import { type Attachment } from '@/lib/s3';

interface DefectDescriptionAttachmentFieldProps {
  value: string;
  onChange: (value: string) => void;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  projectId?: string;
  defectId?: string;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export function DefectDescriptionAttachmentField({
  value,
  onChange,
  attachments,
  onAttachmentsChange,
  projectId,
  defectId,
  placeholder = 'Defectの詳細を入力...',
  rows = 3,
  maxLength = 2000,
}: DefectDescriptionAttachmentFieldProps) {
  return (
    <TextareaWithAttachments
      fieldName="description"
      variant="glass"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      showCharCount={true}
      attachments={attachments}
      onAttachmentsChange={onAttachmentsChange}
      entityId={defectId}
      entityType="defect"
      projectId={projectId}
      showAttachments={true}
      forceShowAttachments={true}
      uploadOnSave={true}
    />
  );
}
