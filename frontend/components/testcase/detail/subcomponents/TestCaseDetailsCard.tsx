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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  expectedResultAttachments = [],
  preconditionAttachments = [],
  postconditionAttachments = [],
  onDescriptionAttachmentsChange,
  onExpectedResultAttachmentsChange,
  onPreconditionAttachmentsChange,
  onPostconditionAttachmentsChange,
}: TestCaseDetailsCardProps) {
  // Find module from modules array if moduleId exists
  const selectedModule = testCase.moduleId ? modules.find(m => m.id === testCase.moduleId) : undefined;
  // Fetch dynamic dropdown options
  const { options: priorityOptions, loading: loadingPriority } = useDropdownOptions('TestCase', 'priority');
  const { options: statusOptions, loading: loadingStatus } = useDropdownOptions('TestCase', 'status');
  const { options: testTypeOptions, loading: loadingTestType } = useDropdownOptions('TestCase', 'testType');

  const handleFieldChange = onFieldChange || ((field, value) => {
    onFormChange({ ...formData, [field]: value });
  });

  // Create safe attachment handlers with default no-op functions
  const handleDescriptionAttachmentsChange = onDescriptionAttachmentsChange || (() => {});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

          {/* Custom IDs Section */}
          <div className="space-y-4 pt-6 mt-6 border-t border-white/10">
            <h4 className="text-sm font-medium text-white/60">識別情報</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assertionId">Assertion-ID</Label>
                <Input
                  id="assertionId"
                  variant="glass"
                  value={formData.assertionId || ''}
                  onChange={(e) => handleFieldChange('assertionId', e.target.value)}
                  placeholder="Enter assertion ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rtcId">RTC-ID</Label>
                <Input
                  id="rtcId"
                  variant="glass"
                  value={formData.rtcId || ''}
                  onChange={(e) => handleFieldChange('rtcId', e.target.value)}
                  placeholder="Enter RTC ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flowId">Flow-ID</Label>
                <Input
                  id="flowId"
                  variant="glass"
                  value={formData.flowId || ''}
                  onChange={(e) => handleFieldChange('flowId', e.target.value)}
                  placeholder="Enter flow ID"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="layer">Layer</Label>
                <Select
                  value={formData.layer || ''}
                  onValueChange={(value) => handleFieldChange('layer', value)}
                >
                  <SelectTrigger variant="glass" id="layer">
                    <SelectValue placeholder="Select layer" />
                  </SelectTrigger>
                  <SelectContent variant="glass">
                    <SelectItem value="SMOKE">Smoke</SelectItem>
                    <SelectItem value="CORE">Core</SelectItem>
                    <SelectItem value="EXTENDED">Extended</SelectItem>
                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetType">対象</Label>
                <Select
                  value={formData.targetType || ''}
                  onValueChange={(value) => handleFieldChange('targetType', value)}
                >
                  <SelectTrigger variant="glass" id="targetType">
                    <SelectValue placeholder="Select target type" />
                  </SelectTrigger>
                  <SelectContent variant="glass">
                    <SelectItem value="API">API</SelectItem>
                    <SelectItem value="SCREEN">画面</SelectItem>
                    <SelectItem value="FUNCTIONAL">Functional</SelectItem>
                    <SelectItem value="NON_FUNCTIONAL">Non-Functional</SelectItem>
                    <SelectItem value="PERFORMANCE">Performance</SelectItem>
                    <SelectItem value="SECURITY">Security</SelectItem>
                    <SelectItem value="USABILITY">Usability</SelectItem>
                    <SelectItem value="COMPATIBILITY">Compatibility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="testType">テスト種別</Label>
                <Select
                  value={formData.testType || ''}
                  onValueChange={(value) => handleFieldChange('testType', value)}
                >
                  <SelectTrigger variant="glass" id="testType">
                    <SelectValue placeholder="テスト種別を選択" />
                  </SelectTrigger>
                  <SelectContent variant="glass">
                    {loadingTestType ? (
                      <SelectItem value="loading" disabled>Loading...</SelectItem>
                    ) : (
                      testTypeOptions.map((opt) => (
                        <SelectItem key={opt.id} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
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

          {/* isAutomated */}
          <div className="space-y-2">
            <Label htmlFor="isAutomated">自動化</Label>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAutomated"
                checked={formData.isAutomated || false}
                onChange={(e) => handleFieldChange('isAutomated', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="isAutomated" className="text-sm text-white/70">
                自動化テスト
              </label>
            </div>
          </div>

          {/* Evidence */}
          <div className="space-y-2">
            <Label htmlFor="evidence">根拠</Label>
            <Textarea
              id="evidence"
              variant="glass"
              value={formData.evidence || ''}
              onChange={(e) => handleFieldChange('evidence', e.target.value)}
              placeholder="Enter evidence"
              rows={3}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">備考</Label>
            <Textarea
              id="notes"
              variant="glass"
              value={formData.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Enter notes"
              rows={3}
            />
          </div>
        </div>
      ) : (
        <>
          {selectedModule && (
            <div>
              <h4 className="text-sm font-medium text-white/60 mb-1">
                Module
              </h4>
              <p className="text-white/90">{selectedModule.name}</p>
            </div>
          )}

          {/* Custom Fields Section */}
          {(testCase.assertionId || testCase.rtcId || testCase.flowId || testCase.layer || testCase.targetType || testCase.testType) && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-3">
                識別情報
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {testCase.assertionId && (
                  <div>
                    <span className="text-xs text-white/50">Assertion-ID</span>
                    <p className="text-sm text-white/90">{testCase.assertionId}</p>
                  </div>
                )}
                {testCase.rtcId && (
                  <div>
                    <span className="text-xs text-white/50">RTC-ID</span>
                    <p className="text-sm text-white/90">{testCase.rtcId}</p>
                  </div>
                )}
                {testCase.flowId && (
                  <div>
                    <span className="text-xs text-white/50">Flow-ID</span>
                    <p className="text-sm text-white/90">{testCase.flowId}</p>
                  </div>
                )}
                {testCase.layer && (
                  <div>
                    <span className="text-xs text-white/50">Layer</span>
                    <p className="text-sm text-white/90">{testCase.layer}</p>
                  </div>
                )}
                {testCase.testType && (
                  <div>
                    <span className="text-xs text-white/50">テスト種別</span>
                    <p className="text-sm text-white/90">
                      {testTypeOptions.find(opt => opt.value === testCase.testType)?.label || testCase.testType}
                    </p>
                  </div>
                )}
                {testCase.targetType && (
                  <div>
                    <span className="text-xs text-white/50">対象</span>
                    <p className="text-sm text-white/90">{testCase.targetType}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Automation & Platforms */}
          {(testCase.automationStatus || (testCase.platforms && testCase.platforms.length > 0)) && (
            <div className="border-t border-white/10 pt-6">
              <div className="grid grid-cols-2 gap-4">
                {testCase.automationStatus && (
                  <div>
                    <span className="text-xs text-white/50">自動化ステータス</span>
                    <p className="text-sm text-white/90">{testCase.automationStatus}</p>
                  </div>
                )}
                {testCase.platforms && testCase.platforms.length > 0 && (
                  <div>
                    <span className="text-xs text-white/50">環境</span>
                    <div className="flex gap-1 mt-1">
                      {testCase.platforms.map((platform) => (
                        <span
                          key={platform}
                          className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* isAutomated */}
          <div className="border-t border-white/10 pt-6">
            <h4 className="text-sm font-medium text-white/60 mb-2">
              自動化
            </h4>
            <span className={`text-sm px-2 py-1 rounded ${testCase.isAutomated ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
              {testCase.isAutomated ? '自動化済み' : '手動'}
            </span>
          </div>

          {/* Evidence */}
          {testCase.evidence && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-2">
                根拠
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {testCase.evidence}
              </p>
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

          {/* Notes */}
          {testCase.notes && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-2">
                備考
              </h4>
              <p className="text-white/90 whitespace-pre-wrap break-words">
                {testCase.notes}
              </p>
            </div>
          )}
        </>
      )}
    </DetailCard>
  );
}
