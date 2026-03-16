'use client';

import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Clock, Paperclip } from 'lucide-react';
import { TestCase, TestCaseFormData, Module } from '../../types';
import { useState } from 'react';
import { FileUploadModal } from '@/frontend/reusable-components/uploads/FileUploadModal';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Textarea } from '@/frontend/reusable-elements/textareas/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/frontend/reusable-elements/selects/Select';
import { type Attachment } from '@/lib/s3';
import { AttachmentDisplay } from '@/frontend/reusable-components/attachments/AttachmentDisplay';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

interface TestCaseDetailsCardProps {
  testCase: TestCase;
  isEditing: boolean;
  formData: TestCaseFormData;
  errors?: Record<string, string>;
  modules?: Module[];
  onFormChange: (data: TestCaseFormData) => void;
  onFieldChange?: (field: keyof TestCaseFormData, value: string | number | null) => void;
  projectId?: string;
  // Attachments - consolidated
  commonAttachments?: Attachment[];
  onCommonAttachmentsChange?: (attachments: Attachment[]) => void;
}

export function TestCaseDetailsCard({
  testCase,
  isEditing,
  formData,
  errors = {},
  modules = [],
  onFormChange,
  onFieldChange,
  projectId,
  commonAttachments = [],
  onCommonAttachmentsChange,
}: TestCaseDetailsCardProps) {
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);

  // Fetch dynamic dropdown options
  const { options: priorityOptions, loading: loadingPriority } = useDropdownOptions('TestCase', 'priority');
  const { options: statusOptions, loading: loadingStatus } = useDropdownOptions('TestCase', 'status');

  const handleFieldChange = onFieldChange || ((field, value) => {
    onFormChange({ ...formData, [field]: value });
  });

  // Create safe attachment handler with default no-op function
  const handleCommonAttachmentsChange = onCommonAttachmentsChange || (() => {});

  return (
    <DetailCard title="Details" contentClassName="space-y-4">
      {isEditing ? (
        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              variant="glass"
              value={formData.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              placeholder="Enter test case title"
              maxLength={200}
            />
            {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
          </div>

          {/* Priority and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleFieldChange('priority', value)}
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

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleFieldChange('status', value)}
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
          </div>

          {/* Module */}
          <div className="space-y-2">
            <Label htmlFor="moduleId">Module</Label>
            <Select
              value={formData.moduleId || 'none'}
              onValueChange={(value) => handleFieldChange('moduleId', value === 'none' ? null : value)}
            >
              <SelectTrigger variant="glass" id="moduleId">
                <SelectValue />
              </SelectTrigger>
              <SelectContent variant="glass">
                <SelectItem value="none">None (No Module)</SelectItem>
                {modules?.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Time */}
          <div className="space-y-2 pt-6 mt-6 border-t border-white/10">
            <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
            <Input
              id="estimatedTime"
              variant="glass"
              type="number"
              value={formData.estimatedTime}
              onChange={(e) => handleFieldChange('estimatedTime', e.target.value)}
              placeholder="Enter estimated time"
              className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              variant="glass"
              value={formData.description}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Enter test case description"
              rows={3}
              maxLength={250}
            />
            {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
          </div>

          {/* Preconditions */}
          <div className="space-y-2">
            <Label htmlFor="preconditions">Preconditions</Label>
            <Textarea
              id="preconditions"
              variant="glass"
              value={formData.preconditions}
              onChange={(e) => handleFieldChange('preconditions', e.target.value)}
              placeholder="Enter preconditions"
              rows={3}
              maxLength={250}
            />
          </div>

          {/* Postconditions */}
          <div className="space-y-2">
            <Label htmlFor="postconditions">Postconditions</Label>
            <Textarea
              id="postconditions"
              variant="glass"
              value={formData.postconditions}
              onChange={(e) => handleFieldChange('postconditions', e.target.value)}
              placeholder="Enter postconditions"
              rows={3}
              maxLength={250}
            />
          </div>

          {/* Test Data */}
          <div className="space-y-2">
            <Label htmlFor="testData">Test Data</Label>
            <Textarea
              id="testData"
              variant="glass"
              value={formData.testData}
              onChange={(e) => handleFieldChange('testData', e.target.value)}
              placeholder="Enter test data or input values"
              rows={3}
              maxLength={500}
            />
            {errors.testData && <p className="text-xs text-red-400">{errors.testData}</p>}
          </div>

          {/* Common Attachments (Description, Preconditions, Postconditions) */}
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
                entityType="testcase"
                projectId={projectId}
                title="Test Case Attachments"
              />
            </DetailCard>
          </div>
        </div>
      ) : (
        <>
          {testCase.module && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Module
              </h4>
              <p className="text-white/90">{testCase.module.name}</p>
            </div>
          )}

          {testCase.description && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-2">
                Description
              </h4>
              <p className="text-white/90 break-words whitespace-pre-wrap">{testCase.description}</p>
            </div>
          )}

          {testCase.estimatedTime && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Estimated Time
              </h4>
              <div className="flex items-center gap-2 text-white/90">
                <Clock className="w-4 h-4" />
                <span>{testCase.estimatedTime} minutes</span>
              </div>
            </div>
          )}

          {testCase.preconditions && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-2">
                Preconditions
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {testCase.preconditions}
              </p>
            </div>
          )}

          {testCase.postconditions && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-2">
                Postconditions
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {testCase.postconditions}
              </p>
            </div>
          )}

          {testCase.testData && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-2">
                Test Data
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {testCase.testData}
              </p>
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
