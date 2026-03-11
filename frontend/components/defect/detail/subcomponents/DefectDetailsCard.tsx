'use client';

import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Defect, DefectFormData } from '../types';
import { SelectOption } from '@/frontend/reusable-components';
import { useEffect, useState } from 'react';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { type Attachment } from '@/lib/s3';
import { AttachmentDisplay } from '@/frontend/reusable-components/attachments/AttachmentDisplay';
import { DefectDescriptionAttachmentField } from '@/frontend/components/defect/shared/DefectDescriptionAttachmentField';
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
  defectId?: string;
  onSave?: () => void;
  saving?: boolean;
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
  projectId,
  defectId,
  onSave,
  saving = false,
  descriptionAttachments = [],
  onDescriptionAttachmentsChange,
}: DefectDetailsCardProps) {
  const [users, setUsers] = useState<User[]>([]);
  
  // Fetch dynamic dropdown options
  const { options: severityOptions, loading: loadingSeverity } = useDropdownOptions('Defect', 'severity');
  const { options: priorityOptions, loading: loadingPriority } = useDropdownOptions('Defect', 'priority');
  const { options: statusOptions, loading: loadingStatus } = useDropdownOptions('Defect', 'status');

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

  const assignedToOptions: SelectOption[] = [
    { value: 'unassigned', label: '未割当' },
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
    <DetailCard title="詳細" contentClassName="space-y-6">
      {isEditing ? (
        <div className="space-y-4">
          {/* Severity and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">
                深刻度 <span className="text-red-500">*</span>
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
                    <SelectItem value="loading" disabled>読み込み中...</SelectItem>
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
                優先度 <span className="text-red-500">*</span>
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
                    <SelectItem value="loading" disabled>読み込み中...</SelectItem>
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
                ステータス <span className="text-red-500">*</span>
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
                    <SelectItem value="loading" disabled>読み込み中...</SelectItem>
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
              <Label htmlFor="assignedToId">担当者</Label>
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
              <Label htmlFor="dueDate">期限</Label>
              <Input
                id="dueDate"
                variant="glass"
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => handleSelectChange('dueDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="progressPercentage">進捗 (%)</Label>
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
            <Label htmlFor="description">説明</Label>
            <DefectDescriptionAttachmentField
              value={formData.description || ''}
              onChange={(value) => handleFieldChange('description', value)}
              attachments={descriptionAttachments}
              onAttachmentsChange={handleDescriptionAttachmentsChange}
              projectId={projectId}
              defectId={defectId}
              placeholder="Defectの詳細な説明"
              rows={4}
              maxLength={2000}
            />
            {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
          </div>

          {/* Environment */}
          <div className="space-y-2">
            <Label htmlFor="environment">環境</Label>
            <Input
              id="environment"
              variant="glass"
              value={formData.environment || ''}
              onChange={(e) => handleFieldChange('environment', e.target.value)}
              placeholder="例: Production, Staging, Development"
            />
          </div>

          <div className="flex justify-end pt-2">
            <ButtonPrimary
              type="button"
              onClick={onSave}
              disabled={saving}
              className="cursor-pointer"
            >
              {saving ? '保存中...' : '保存する'}
            </ButtonPrimary>
          </div>
        </div>
      ) : (
        <>
          {(defect.description || descriptionAttachments.length > 0) && (
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-white/60">
                  説明
                </h4>
                {descriptionAttachments.length > 0 ? (
                  <span className="text-xs text-white/50">添付 {descriptionAttachments.length} 件</span>
                ) : (
                  <span className="text-xs text-white/40">添付なし</span>
                )}
              </div>
              {defect.description && descriptionAttachments.length > 0 ? (
                <div className="flex gap-4 items-start">
                  <p className="text-white/90 break-words whitespace-pre-wrap flex-1">
                    {defect.description}
                  </p>
                  <div className="flex-shrink-0">
                    <AttachmentDisplay attachments={descriptionAttachments} />
                  </div>
                </div>
              ) : defect.description ? (
                <p className="text-white/90 break-words whitespace-pre-wrap">
                  {defect.description}
                </p>
              ) : descriptionAttachments.length > 0 ? (
                <div className="flex justify-end">
                  <AttachmentDisplay attachments={descriptionAttachments} />
                </div>
              ) : null}
            </div>
          )}

          {defect.environment && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-1">
                環境
              </h4>
              <p className="text-white/90 break-words whitespace-pre-wrap">
                {defect.environment}
              </p>
            </div>
          )}

          {defect.dueDate && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-1">
                期限
              </h4>
              <p className="text-white/90">
                {new Date(defect.dueDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {defect.progressPercentage !== null && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-1">
                進捗
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
        </>
      )}
    </DetailCard>
  );
}
