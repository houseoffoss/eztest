'use client';

import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Defect, DefectFormData } from '../types';
import { FormBuilder, FormFieldConfig, SelectOption } from '@/frontend/reusable-components';
import { useEffect, useState } from 'react';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Textarea } from '@/frontend/reusable-elements/textareas/Textarea';
import { type Attachment } from '@/lib/s3';
import { AttachmentDisplay } from '@/frontend/reusable-components/attachments/AttachmentDisplay';
import { FileUploadModal } from '@/frontend/reusable-components/uploads/FileUploadModal';
import { Paperclip } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/frontend/reusable-elements/selects/Select';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

interface DefectDetailsCardProps {
  defect: Defect;
  isEditing: boolean;
  formData: DefectFormData;
  errors?: Record<string, string>;
  onFormChange: (data: DefectFormData) => void;
  onFieldChange?: (field: keyof DefectFormData, value: string | number | null) => void;
  projectId?: string;
  // Attachments - consolidated
  commonAttachments?: Attachment[];
  onCommonAttachmentsChange?: (attachments: Attachment[]) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
}

export function DefectDetailsCard({
  defect,
  isEditing,
  formData,
  errors = {},
  onFormChange,
  onFieldChange,
  projectId,
  commonAttachments = [],
  onCommonAttachmentsChange,
}: DefectDetailsCardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);

  // Fetch dynamic dropdown options
  const { options: severityOptions, loading: loadingSeverity } = useDropdownOptions('Defect', 'severity');
  const { options: priorityOptions, loading: loadingPriority } = useDropdownOptions('Defect', 'priority');
  const { options: statusOptions, loading: loadingStatus } = useDropdownOptions('Defect', 'status');

  const handleFieldChange = onFieldChange || ((field, value) => {
    onFormChange({ ...formData, [field]: value });
  });

  // Create safe attachment handler with default no-op function
  const handleCommonAttachmentsChange = onCommonAttachmentsChange || (() => {});

  useEffect(() => {
    if (isEditing) {
      fetch(`/api/projects/${defect.projectId}/members`)
        .then((res) => res.json())
        .then((data: { data?: Array<{ user: { id: string; name: string; email: string } }> }) => {
          if (data.data && Array.isArray(data.data)) {
            const mappedUsers = data.data.map((member) => ({
              id: member.user.id,
              name: member.user.name,
              email: member.user.email,
            }));
            setUsers(mappedUsers);
          }
        })
        .catch((err) => console.error('Failed to fetch users:', err));
    }
  }, [isEditing, defect.projectId]);

  const assignedToOptions: SelectOption[] = [
    { value: 'unassigned', label: 'Not Assigned' },
    ...users.map((user) => ({
      value: user.id,
      label: `${user.name} (${user.email})`,
    })),
  ];

  const handleSelectChange = (field: keyof DefectFormData, value: string | number | null) => {
    if (field === 'assignedToId' && value === 'unassigned') {
      onFormChange({ ...formData, assignedToId: null });
    } else if (field === 'progressPercentage') {
      const numValue = value !== null && value !== '' ? Number(value) : null;
      if (numValue === null || (numValue >= 0 && numValue <= 100)) {
        onFormChange({ ...formData, [field]: numValue });
      }
    } else if (field === 'dueDate') {
      // Keep as date string for form display, only convert to ISO datetime on actual save
      const dateStr = typeof value === 'string' ? value : null;
      onFormChange({ ...formData, [field]: dateStr });
    } else {
      onFormChange({ ...formData, [field]: value });
    }
  };

  return (
    <DetailCard title="Details" contentClassName="space-y-6">
      {isEditing ? (
        <div className="space-y-4">
          {/* Severity and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">
                Severity <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.severity}
                onValueChange={(value) => handleSelectChange('severity', value)}
              >
                <SelectTrigger variant="glass" id="severity">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent variant="glass">
                  {loadingSeverity ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    severityOptions.map((opt) => (
                      <SelectItem 
                        key={opt.id} 
                        value={opt.value}
                      >
                        {opt.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleSelectChange('priority', value)}
              >
                <SelectTrigger variant="glass" id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent variant="glass">
                  {loadingPriority ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    priorityOptions.map((opt) => (
                      <SelectItem 
                        key={opt.id} 
                        value={opt.value}
                      >
                        {opt.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status and Assigned To */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger variant="glass" id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent variant="glass">
                  {loadingStatus ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    statusOptions.map((opt) => (
                      <SelectItem 
                        key={opt.id} 
                        value={opt.value}
                      >
                        {opt.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedToId">Assigned To</Label>
              <Select
                value={formData.assignedToId || 'unassigned'}
                onValueChange={(value) => handleSelectChange('assignedToId', value)}
              >
                <SelectTrigger variant="glass" id="assignedToId">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent variant="glass">
                  {assignedToOptions.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date and Progress */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                variant="glass"
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => handleSelectChange('dueDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="progressPercentage">Progress (%)</Label>
              <Input
                id="progressPercentage"
                variant="glass"
                type="number"
                placeholder="0-100"
                value={formData.progressPercentage ?? ''}
                onChange={(e) => handleSelectChange('progressPercentage', e.target.value)}
                className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              variant="glass"
              value={formData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Detailed description of the defect"
              rows={4}
              maxLength={2000}
            />
            {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
          </div>

          {/* Common Attachments */}
          <div className="pt-2">
            <DetailCard
              title="Attachments"
              contentClassName="space-y-3"
              headerAction={
                <button
                  type="button"
                  onClick={() => setAttachmentModalOpen(true)}
                  className="text-white/60 hover:text-white p-1 rounded transition-colors"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              }
            >
              {commonAttachments.length > 0 ? (
                <div className="space-y-1">
                  {commonAttachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 text-sm text-white/80 py-1 px-2 bg-white/5 rounded">
                      <Paperclip className="w-3 h-3 shrink-0 text-white/40" />
                      <span className="truncate flex-1">{att.originalName}</span>
                      {att.size && (
                        <span className="text-white/40 text-xs shrink-0">
                          {(att.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                      {att.id.startsWith('pending-') && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 shrink-0">
                          Pending
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-white/40 py-2">No attachments yet</p>
              )}
              <FileUploadModal
                isOpen={attachmentModalOpen}
                onClose={() => setAttachmentModalOpen(false)}
                attachments={commonAttachments}
                onAttachmentsChange={handleCommonAttachmentsChange}
                fieldName="attachment"
                entityType="defect"
                projectId={projectId}
                title="Defect Attachments"
              />
            </DetailCard>
          </div>

          {/* Environment */}
          <div className="space-y-2">
            <Label htmlFor="environment">Environment</Label>
            <Input
              id="environment"
              variant="glass"
              value={formData.environment || ''}
              onChange={(e) => handleFieldChange('environment', e.target.value)}
              placeholder="e.g., Production, Staging, Development"
            />
          </div>
        </div>
      ) : (
        <>
          {defect.description && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-2">
                Description
              </h4>
              <p className="text-white/90 break-words whitespace-pre-wrap">
                {defect.description}
              </p>
            </div>
          )}

          {defect.environment && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Environment
              </h4>
              <p className="text-white/90 break-words whitespace-pre-wrap">
                {defect.environment}
              </p>
            </div>
          )}

          {defect.dueDate && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Due Date
              </h4>
              <p className="text-white/90">
                {new Date(defect.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {defect.progressPercentage !== null && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Progress
              </h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
                    style={{ width: `${defect.progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm text-white/90 min-w-[3rem] text-right">
                  {defect.progressPercentage}%
                </span>
              </div>
            </div>
          )}

          {commonAttachments.length > 0 && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-2">
                Attachments
              </h4>
              <AttachmentDisplay attachments={commonAttachments} />
            </div>
          )}
        </>
      )}
    </DetailCard>
  );
}
