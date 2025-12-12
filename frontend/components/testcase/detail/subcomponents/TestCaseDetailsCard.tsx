'use client';

import { DetailCard } from '@/components/design/DetailCard';
import { Clock, Download, FileText, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { TestCase, TestCaseFormData, Module } from '../../types';
import { Label } from '@/elements/label';
import { Input } from '@/elements/input';
import { TextareaWithAttachments } from '@/elements/textarea-with-attachments';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/elements/select';
import { type Attachment } from '@/lib/s3';
import { AttachmentDisplay } from '@/components/common/AttachmentDisplay';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../constants/testCaseFormConfig';

interface TestCaseDetailsCardProps {
  testCase: TestCase;
  isEditing: boolean;
  formData: TestCaseFormData;
  errors?: Record<string, string>;
  modules?: Module[];
  onFormChange: (data: TestCaseFormData) => void;
  onFieldChange?: (field: keyof TestCaseFormData, value: string | number | null) => void;
  // Attachments
  descriptionAttachments?: Attachment[];
  expectedResultAttachments?: Attachment[];
  preconditionAttachments?: Attachment[];
  postconditionAttachments?: Attachment[];
  onDescriptionAttachmentsChange?: (attachments: Attachment[]) => void;
  onExpectedResultAttachmentsChange?: (attachments: Attachment[]) => void;
  onPreconditionAttachmentsChange?: (attachments: Attachment[]) => void;
  onPostconditionAttachmentsChange?: (attachments: Attachment[]) => void;
}

export function TestCaseDetailsCard({
  testCase,
  isEditing,
  formData,
  errors = {},
  modules = [],
  onFormChange,
  onFieldChange,
  descriptionAttachments = [],
  expectedResultAttachments = [],
  preconditionAttachments = [],
  postconditionAttachments = [],
  onDescriptionAttachmentsChange,
  onExpectedResultAttachmentsChange,
  onPreconditionAttachmentsChange,
  onPostconditionAttachmentsChange,
}: TestCaseDetailsCardProps) {
  const handleFieldChange = onFieldChange || ((field, value) => {
    onFormChange({ ...formData, [field]: value });
  });

  // Create safe attachment handlers with default no-op functions
  const handleDescriptionAttachmentsChange = onDescriptionAttachmentsChange || (() => {});
  const handleExpectedResultAttachmentsChange = onExpectedResultAttachmentsChange || (() => {});
  const handlePreconditionAttachmentsChange = onPreconditionAttachmentsChange || (() => {});
  const handlePostconditionAttachmentsChange = onPostconditionAttachmentsChange || (() => {});

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
              maxLength={50}
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
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
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
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
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
          <div className="space-y-2">
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

          {/* Description with Attachments */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <TextareaWithAttachments
              fieldName="description"
              variant="glass"
              value={formData.description}
              onChange={(value) => handleFieldChange('description', value)}
              placeholder="Enter test case description"
              rows={3}
              maxLength={250}
              showCharCount={true}
              attachments={descriptionAttachments}
              onAttachmentsChange={handleDescriptionAttachmentsChange}
              entityType="testcase"
              showAttachments={true}
            />
            {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
          </div>

          {/* Expected Result with Attachments */}
          <div className="space-y-2">
            <Label htmlFor="expectedResult">Expected Result</Label>
            <TextareaWithAttachments
              fieldName="expectedResult"
              variant="glass"
              value={formData.expectedResult}
              onChange={(value) => handleFieldChange('expectedResult', value)}
              placeholder="Enter expected result"
              rows={3}
              maxLength={250}
              showCharCount={true}
              attachments={expectedResultAttachments}
              onAttachmentsChange={handleExpectedResultAttachmentsChange}
              entityType="testcase"
              showAttachments={true}
            />
            {errors.expectedResult && <p className="text-xs text-red-400">{errors.expectedResult}</p>}
          </div>

          {/* Preconditions with Attachments */}
          <div className="space-y-2">
            <Label htmlFor="preconditions">Preconditions</Label>
            <TextareaWithAttachments
              fieldName="preconditions"
              variant="glass"
              value={formData.preconditions}
              onChange={(value) => handleFieldChange('preconditions', value)}
              placeholder="Enter preconditions"
              rows={3}
              maxLength={250}
              showCharCount={true}
              attachments={preconditionAttachments}
              onAttachmentsChange={handlePreconditionAttachmentsChange}
              entityType="testcase"
              showAttachments={true}
            />
          </div>

          {/* Postconditions with Attachments */}
          <div className="space-y-2">
            <Label htmlFor="postconditions">Postconditions</Label>
            <TextareaWithAttachments
              fieldName="postconditions"
              variant="glass"
              value={formData.postconditions}
              onChange={(value) => handleFieldChange('postconditions', value)}
              placeholder="Enter postconditions"
              rows={3}
              maxLength={250}
              showCharCount={true}
              attachments={postconditionAttachments}
              onAttachmentsChange={handlePostconditionAttachmentsChange}
              entityType="testcase"
              showAttachments={true}
            />
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
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Description
              </h4>
              <p className="text-white/90 break-words whitespace-pre-wrap">{testCase.description}</p>
              {descriptionAttachments.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-xs font-medium text-white/50 mb-2">Attachments ({descriptionAttachments.length})</h5>
                  <AttachmentDisplay attachments={descriptionAttachments} />
                </div>
              )}
            </div>
          )}

          {testCase.expectedResult && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Expected Result
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {testCase.expectedResult}
              </p>
              {expectedResultAttachments.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-xs font-medium text-white/50 mb-2">Attachments ({expectedResultAttachments.length})</h5>
                  <AttachmentDisplay attachments={expectedResultAttachments} />
                </div>
              )}
            </div>
          )}

          {testCase.estimatedTime && (
            <div>
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
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Preconditions
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {testCase.preconditions}
              </p>
              {preconditionAttachments.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-xs font-medium text-white/50 mb-2">Attachments ({preconditionAttachments.length})</h5>
                  <AttachmentDisplay attachments={preconditionAttachments} />
                </div>
              )}
            </div>
          )}

          {testCase.postconditions && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Postconditions
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {testCase.postconditions}
              </p>
              {postconditionAttachments.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-xs font-medium text-white/50 mb-2">Attachments ({postconditionAttachments.length})</h5>
                  <AttachmentDisplay attachments={postconditionAttachments} />
                </div>
              )}
            </div>
          )}
        </>
      )}
    </DetailCard>
  );
}
