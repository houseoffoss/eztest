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
  onFieldChange?: (field: keyof TestCaseFormData, value: string | number | boolean | null) => void;
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
              <Label htmlFor="priority">優先度</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleFieldChange('priority', value)}
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

            <div className="space-y-2">
              <Label htmlFor="status">状態</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleFieldChange('status', value)}
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
                <SelectItem value="none">なし（モジュールに属さない）</SelectItem>
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
                <Label htmlFor="rtcId">RTC-ID</Label>
                <Input
                  id="rtcId"
                  variant="glass"
                  value={formData.rtcId || ''}
                  onChange={(e) => handleFieldChange('rtcId', e.target.value)}
                  placeholder="RTC-ID を入力"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="flowId">Flow-ID</Label>
                <Input
                  id="flowId"
                  variant="glass"
                  value={formData.flowId || ''}
                  onChange={(e) => handleFieldChange('flowId', e.target.value)}
                  placeholder="Flow-ID を入力"
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
                      <SelectItem value="loading" disabled>読み込み中...</SelectItem>
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
              <div className="space-y-2">
                <Label htmlFor="platform">プラットフォーム</Label>
                <Select
                  value={formData.platform || ''}
                  onValueChange={(value) => handleFieldChange('platform', value)}
                >
                  <SelectTrigger variant="glass" id="platform">
                    <SelectValue placeholder="プラットフォームを選択" />
                  </SelectTrigger>
                  <SelectContent variant="glass">
                    <SelectItem value="Web">Web</SelectItem>
                    <SelectItem value="Web(SP)">Web(SP)</SelectItem>
                    <SelectItem value="iOS Native">iOS Native</SelectItem>
                    <SelectItem value="Android Native">Android Native</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="device">端末</Label>
                <Select
                  value={formData.device || ''}
                  onValueChange={(value) => handleFieldChange('device', value)}
                >
                  <SelectTrigger variant="glass" id="device">
                    <SelectValue placeholder="端末を選択" />
                  </SelectTrigger>
                  <SelectContent variant="glass">
                    <SelectItem value="iPhone">iPhone</SelectItem>
                    <SelectItem value="Android">Android</SelectItem>
                    <SelectItem value="PC">PC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domain">ドメイン</Label>
                <Input
                  id="domain"
                  variant="glass"
                  value={formData.domain || ''}
                  onChange={(e) => handleFieldChange('domain', e.target.value)}
                  placeholder="ドメインを入力"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="functionName">機能</Label>
                <Input
                  id="functionName"
                  variant="glass"
                  value={formData.functionName || ''}
                  onChange={(e) => handleFieldChange('functionName', e.target.value)}
                  placeholder="機能を入力"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="executionType">実行方式</Label>
                <Select
                  value={formData.executionType || ''}
                  onValueChange={(value) => handleFieldChange('executionType', value)}
                >
                  <SelectTrigger variant="glass" id="executionType">
                    <SelectValue placeholder="実行方式を選択" />
                  </SelectTrigger>
                  <SelectContent variant="glass">
                    <SelectItem value="手動">手動</SelectItem>
                    <SelectItem value="自動">自動</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="automationStatus">自動化状況</Label>
                <Select
                  value={formData.automationStatus || ''}
                  onValueChange={(value) => handleFieldChange('automationStatus', value)}
                >
                  <SelectTrigger variant="glass" id="automationStatus">
                    <SelectValue placeholder="自動化状況を選択" />
                  </SelectTrigger>
                  <SelectContent variant="glass">
                    <SelectItem value="自動化済">自動化済</SelectItem>
                    <SelectItem value="自動化対象">自動化対象</SelectItem>
                    <SelectItem value="自動化対象外">自動化対象外</SelectItem>
                    <SelectItem value="検討中">検討中</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Estimated Time */}
          <div className="space-y-2 pt-6 mt-6 border-t border-white/10">
            <Label htmlFor="estimatedTime">テスト実行時間（秒）</Label>
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
            <Label htmlFor="preconditions">前提条件</Label>
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
            <Label htmlFor="postconditions">事後条件</Label>
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
            <Label htmlFor="testData">テストデータ</Label>
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

          {/* Evidence */}
          <div className="space-y-2">
            <Label htmlFor="evidence">根拠コード</Label>
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
          {(testCase.rtcId || testCase.flowId || testCase.layer || testCase.testType || testCase.platform || testCase.device || testCase.domain || testCase.functionName || testCase.executionType || testCase.automationStatus) && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-3">
                識別情報
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                {testCase.platform && (
                  <div>
                    <span className="text-xs text-white/50">プラットフォーム</span>
                    <p className="text-sm text-white/90">{testCase.platform}</p>
                  </div>
                )}
                {testCase.device && (
                  <div>
                    <span className="text-xs text-white/50">端末</span>
                    <p className="text-sm text-white/90">{testCase.device}</p>
                  </div>
                )}
                {/* ドメインと機能は常に表示 */}
                <div>
                  <span className="text-xs text-white/50">ドメイン</span>
                  <p className="text-sm text-white/90">{testCase.domain || '（未設定）'}</p>
                </div>
                <div>
                  <span className="text-xs text-white/50">機能</span>
                  <p className="text-sm text-white/90">{testCase.functionName || '（未設定）'}</p>
                </div>
                {/* 実行方式と自動化状況は常に表示 */}
                <div>
                  <span className="text-xs text-white/50">実行方式</span>
                  <p className="text-sm text-white/90">{testCase.executionType || '（未設定）'}</p>
                </div>
                <div>
                  <span className="text-xs text-white/50">自動化状況</span>
                  <p className="text-sm text-white/90">{testCase.automationStatus || '（未設定）'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Evidence */}
          {testCase.evidence && (
            <div className="border-t border-white/10 pt-6">
              <h4 className="text-sm font-medium text-white/60 mb-2">
根拠コード
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
                  <span className="text-xs text-white/40">添付なし</span>
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
                テスト実行時間
              </h4>
              <div className="flex items-center gap-2 text-white/90">
                <Clock className="w-4 h-4" />
                <span className="font-mono">
                  {String(Math.floor(testCase.estimatedTime / 3600)).padStart(2, '0')}:
                  {String(Math.floor((testCase.estimatedTime % 3600) / 60)).padStart(2, '0')}:
                  {String(testCase.estimatedTime % 60).padStart(2, '0')}
                </span>
              </div>
            </div>
          )}

          {(testCase.preconditions || preconditionAttachments.length > 0) && (
            <div className="border-t border-white/10 pt-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-white/60">
                  前提条件
                </h4>
                {preconditionAttachments.length > 0 ? (
                  <span className="text-xs text-white/50">{preconditionAttachments.length} Attachments</span>
                ) : (
                  <span className="text-xs text-white/40">添付なし</span>
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
                  事後条件
                </h4>
                {postconditionAttachments.length > 0 ? (
                  <span className="text-xs text-white/50">{postconditionAttachments.length} Attachments</span>
                ) : (
                  <span className="text-xs text-white/40">添付なし</span>
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
                テストデータ
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
