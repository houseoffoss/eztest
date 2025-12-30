'use client';

import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Clock } from 'lucide-react';
import { TestCase, TestCaseFormData, Module } from '../../types';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { TextareaWithAttachments } from '@/frontend/reusable-elements/textareas/TextareaWithAttachments';
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
  projectId,
  descriptionAttachments = [],
  expectedResultAttachments = [],
  preconditionAttachments = [],
  postconditionAttachments = [],
  onDescriptionAttachmentsChange,
  onExpectedResultAttachmentsChange,
  onPreconditionAttachmentsChange,
  onPostconditionAttachmentsChange,
}: TestCaseDetailsCardProps) {
  // Fetch dynamic dropdown options
  const { options: priorityOptions, loading: loadingPriority } = useDropdownOptions('TestCase', 'priority');
  const { options: statusOptions, loading: loadingStatus } = useDropdownOptions('TestCase', 'status');

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
              projectId={projectId}
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
              projectId={projectId}
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
              projectId={projectId}
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
              projectId={projectId}
              showAttachments={true}
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

          {(testCase.description || descriptionAttachments.length > 0) && (
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-white/60">
                  Description
                </h4>
                {descriptionAttachments.length > 0 ? (
                  <span className="text-xs text-white/50">{descriptionAttachments.length} Attachments</span>
                ) : (
                  <span className="text-xs text-white/40">No Attachments</span>
                )}
              </div>
              {testCase.description && descriptionAttachments.length > 0 ? (
                <div className="flex gap-4 items-start">
                  <p className="text-white/90 break-words whitespace-pre-wrap flex-1">{testCase.description}</p>
                  <div className="flex-shrink-0">
                    <AttachmentDisplay attachments={descriptionAttachments} />
                  </div>
                </div>
              ) : testCase.description ? (
                <p className="text-white/90 break-words whitespace-pre-wrap">{testCase.description}</p>
              ) : descriptionAttachments.length > 0 ? (
                <div className="flex justify-end">
                  <AttachmentDisplay attachments={descriptionAttachments} />
                </div>
              ) : null}
            </div>
          )}

          {(testCase.expectedResult || expectedResultAttachments.length > 0) && (
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-white/60">
                  Expected Result
                </h4>
                {expectedResultAttachments.length > 0 ? (
                  <span className="text-xs text-white/50">{expectedResultAttachments.length} Attachments</span>
                ) : (
                  <span className="text-xs text-white/40">No Attachments</span>
                )}
              </div>
              {testCase.expectedResult && expectedResultAttachments.length > 0 ? (
                <div className="flex gap-4 items-start">
                  <p className="text-white/90 whitespace-pre-wrap break-words flex-1">
                    {testCase.expectedResult}
                  </p>
                  <div className="flex-shrink-0">
                    <AttachmentDisplay attachments={expectedResultAttachments} />
                  </div>
                </div>
              ) : testCase.expectedResult ? (
                <p className="text-white/90 whitespace-pre-wrap break-words">
                  {testCase.expectedResult}
                </p>
              ) : expectedResultAttachments.length > 0 ? (
                <div className="flex justify-end">
                  <AttachmentDisplay attachments={expectedResultAttachments} />
                </div>
              ) : null}
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

          {(testCase.preconditions || preconditionAttachments.length > 0) && (
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-white/60">
                  Preconditions
                </h4>
                {preconditionAttachments.length > 0 ? (
                  <span className="text-xs text-white/50">{preconditionAttachments.length} Attachments</span>
                ) : (
                  <span className="text-xs text-white/40">No Attachments</span>
                )}
              </div>
              {testCase.preconditions && preconditionAttachments.length > 0 ? (
                <div className="flex gap-4 items-start">
                  <p className="text-white/90 whitespace-pre-wrap break-words flex-1">
                    {testCase.preconditions}
                  </p>
                  <div className="flex-shrink-0">
                    <AttachmentDisplay attachments={preconditionAttachments} />
                  </div>
                </div>
              ) : testCase.preconditions ? (
                <p className="text-white/90 whitespace-pre-wrap break-words">
                  {testCase.preconditions}
                </p>
              ) : preconditionAttachments.length > 0 ? (
                <div className="flex justify-end">
                  <AttachmentDisplay attachments={preconditionAttachments} />
                </div>
              ) : null}
            </div>
          )}

          {(testCase.postconditions || postconditionAttachments.length > 0) && (
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-white/60">
                  Postconditions
                </h4>
                {postconditionAttachments.length > 0 ? (
                  <span className="text-xs text-white/50">{postconditionAttachments.length} Attachments</span>
                ) : (
                  <span className="text-xs text-white/40">No Attachments</span>
                )}
              </div>
              {testCase.postconditions && postconditionAttachments.length > 0 ? (
                <div className="flex gap-4 items-start">
                  <p className="text-white/90 whitespace-pre-wrap break-words flex-1">
                    {testCase.postconditions}
                  </p>
                  <div className="flex-shrink-0">
                    <AttachmentDisplay attachments={postconditionAttachments} />
                  </div>
                </div>
              ) : testCase.postconditions ? (
                <p className="text-white/90 whitespace-pre-wrap break-words">
                  {testCase.postconditions}
                </p>
              ) : postconditionAttachments.length > 0 ? (
                <div className="flex justify-end">
                  <AttachmentDisplay attachments={postconditionAttachments} />
                </div>
              ) : null}
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
        </>
      )}
    </DetailCard>
  );
}
