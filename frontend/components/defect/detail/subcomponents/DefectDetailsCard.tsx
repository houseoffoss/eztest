'use client';

import { DetailCard } from '@/components/design/DetailCard';
import { Defect, DefectFormData } from '../types';
import { FormBuilder, FormFieldConfig, SelectOption } from '@/frontend/components/form';
import { useEffect, useState } from 'react';
import { Label } from '@/elements/label';
import { Input } from '@/elements/input';
import { TextareaWithAttachments } from '@/elements/textarea-with-attachments';
import { type Attachment } from '@/lib/s3';
import { AttachmentDisplay } from '@/components/common/AttachmentDisplay';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/elements/select';

interface DefectDetailsCardProps {
  defect: Defect;
  isEditing: boolean;
  formData: DefectFormData;
  errors?: Record<string, string>;
  onFormChange: (data: DefectFormData) => void;
  onFieldChange?: (field: keyof DefectFormData, value: string | number | null) => void;
  // Attachments
  descriptionAttachments?: Attachment[];
  onDescriptionAttachmentsChange?: (attachments: Attachment[]) => void;
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
  descriptionAttachments = [],
  onDescriptionAttachmentsChange,
}: DefectDetailsCardProps) {
  const [users, setUsers] = useState<User[]>([]);

  const handleFieldChange = onFieldChange || ((field, value) => {
    onFormChange({ ...formData, [field]: value });
  });

  // Create safe attachment handlers with default no-op functions
  const handleDescriptionAttachmentsChange = onDescriptionAttachmentsChange || (() => {});

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

  const SEVERITY_OPTIONS: SelectOption[] = [
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

  const PRIORITY_OPTIONS: SelectOption[] = [
    { value: 'CRITICAL', label: 'Critical' },
    { value: 'HIGH', label: 'High' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'LOW', label: 'Low' },
  ];

  const STATUS_OPTIONS: SelectOption[] = [
    { value: 'NEW', label: 'New' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'FIXED', label: 'Fixed' },
    { value: 'TESTED', label: 'Tested' },
    { value: 'CLOSED', label: 'Closed' },
  ];

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
                  {SEVERITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
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
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
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
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
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

          {/* Description with Attachments */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <TextareaWithAttachments
              fieldName="description"
              variant="glass"
              value={formData.description || ''}
              onChange={(value) => handleFieldChange('description', value)}
              placeholder="Detailed description of the defect"
              rows={4}
              maxLength={2000}
              showCharCount={true}
              attachments={descriptionAttachments}
              onAttachmentsChange={handleDescriptionAttachmentsChange}
              entityType="defect"
              showAttachments={true}
            />
            {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
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
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Description
              </h4>
              <p className="text-white/90 break-words whitespace-pre-wrap">
                {defect.description}
              </p>
              {descriptionAttachments.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-xs font-medium text-white/50 mb-2">Attachments ({descriptionAttachments.length})</h5>
                  <AttachmentDisplay attachments={descriptionAttachments} />
                </div>
              )}
            </div>
          )}

          {defect.environment && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Environment
              </h4>
              <p className="text-white/90 break-words whitespace-pre-wrap">
                {defect.environment}
              </p>
            </div>
          )}

          {defect.dueDate && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Due Date
              </h4>
              <p className="text-white/90">
                {new Date(defect.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {defect.progressPercentage !== null && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Progress
              </h4>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${defect.progressPercentage}%` }}
                  />
                </div>
                <span className="text-sm text-white/90 min-w-[3rem] text-right">
                  {defect.progressPercentage}%
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </DetailCard>
  );
}
