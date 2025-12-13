'use client';

import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { DetailCard } from '@/components/design/DetailCard';
import { Input } from '@/elements/input';
import { Label } from '@/elements/label';
import { TextareaWithAttachments } from '@/elements/textarea-with-attachments';
import { GripVertical, Plus, Trash2, Download, FileText, Image as ImageIcon, File as FileIcon } from 'lucide-react';
import { TestStep } from '../types';
import { type Attachment } from '@/lib/s3';
import { AttachmentDisplay } from '@/components/common/AttachmentDisplay';

interface TestStepsCardProps {
  steps: TestStep[];
  isEditing: boolean;
  addingStep: boolean;
  newStep: { action: string; expectedResult: string };
  onStepsChange: (steps: TestStep[]) => void;
  onAddingStepChange: (adding: boolean) => void;
  onNewStepChange: (step: { action: string; expectedResult: string }) => void;
  onAddStep: () => void;
  onRemoveStep: (stepNumber: number) => void;
  // Attachment props
  stepAttachments?: Record<string, Record<string, Attachment[]>>;
  onStepAttachmentsChange?: (stepId: string, field: string, attachments: Attachment[]) => void;
  testCaseId?: string;
  // New step attachment props
  newStepActionAttachments?: Attachment[];
  newStepExpectedResultAttachments?: Attachment[];
  onNewStepActionAttachmentsChange?: (attachments: Attachment[]) => void;
  onNewStepExpectedResultAttachmentsChange?: (attachments: Attachment[]) => void;
}

export function TestStepsCard({
  steps,
  isEditing,
  addingStep,
  newStep,
  onStepsChange,
  onAddingStepChange,
  onNewStepChange,
  onAddStep,
  onRemoveStep,
  stepAttachments = {},
  onStepAttachmentsChange,
  testCaseId,
  newStepActionAttachments = [],
  newStepExpectedResultAttachments = [],
  onNewStepActionAttachmentsChange,
  onNewStepExpectedResultAttachmentsChange,
}: TestStepsCardProps) {
  return (
    <DetailCard
      title="Test Steps"
      contentClassName="space-y-3"
      headerAction={
        isEditing ? (
          <Button
            size="sm"
            variant="glass"
            onClick={() => onAddingStepChange(true)}
            disabled={addingStep}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Step
          </Button>
        ) : undefined
      }
    >
      <div className="space-y-3">
        {steps.length === 0 ? (
          <p className="text-white/60 text-center py-8">
            No test steps defined yet
          </p>
        ) : (
          steps.map((step) => (
            <div
              key={step.stepNumber}
              className="border border-white/10 rounded-lg p-4 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    {isEditing && (
                      <GripVertical className="w-4 h-4 text-white/60" />
                    )}
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-semibold text-blue-500">
                      {step.stepNumber}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div>
                      <h5 className="text-xs font-medium text-white/60 mb-1">
                        Action
                      </h5>
                      {isEditing ? (
                        <TextareaWithAttachments
                          variant="glass"
                          value={step.action}
                          onChange={(e) => {
                            const updated = steps.map((s) =>
                              s.stepNumber === step.stepNumber
                                ? { ...s, id: s.id, action: e }
                                : s
                            );
                            onStepsChange(updated);
                          }}
                          placeholder="Enter action"
                          fieldName="action"
                          attachments={step.id && stepAttachments ? stepAttachments[step.id]?.action || [] : []}
                          onAttachmentsChange={(attachments) => {
                            if (onStepAttachmentsChange && step.id) {
                              onStepAttachmentsChange(step.id, 'action', attachments);
                            }
                          }}
                          entityType="teststep"
                          showAttachments={true}
                        />
                      ) : (
                        <div className="space-y-2">
                          <div className="px-4 py-3 rounded-[10px] bg-[#101a2b]/70 border border-white/15 text-white/90 break-words min-h-24">
                            {step.action}
                          </div>
                          {step.id && stepAttachments?.[step.id]?.action && stepAttachments[step.id].action.length > 0 && (
                            <div className="mt-2">
                              <AttachmentDisplay attachments={stepAttachments[step.id].action} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-white/60 mb-1">
                        Expected Result
                      </h5>
                      {isEditing ? (
                        <TextareaWithAttachments
                          variant="glass"
                          value={step.expectedResult}
                          onChange={(e) => {
                            const updated = steps.map((s) =>
                              s.stepNumber === step.stepNumber
                                ? { ...s, id: s.id, expectedResult: e }
                                : s
                            );
                            onStepsChange(updated);
                          }}
                          placeholder="Enter expected result"
                          fieldName="expectedResult"
                          attachments={step.id && stepAttachments ? stepAttachments[step.id]?.expectedResult || [] : []}
                          onAttachmentsChange={(attachments) => {
                            if (onStepAttachmentsChange && step.id) {
                              onStepAttachmentsChange(step.id, 'expectedResult', attachments);
                            }
                          }}
                          entityType="teststep"
                          showAttachments={true}
                        />
                      ) : (
                        <div className="space-y-2">
                          <div className="px-4 py-3 rounded-[10px] bg-[#101a2b]/70 border border-white/15 text-white/90 break-words min-h-24">
                            {step.expectedResult}
                          </div>
                          {step.id && stepAttachments?.[step.id]?.expectedResult && stepAttachments[step.id].expectedResult.length > 0 && (
                            <div className="mt-2">
                              <AttachmentDisplay attachments={stepAttachments[step.id].expectedResult} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-pointer hover:bg-red-400/10 hover:text-red-400"
                      onClick={() => onRemoveStep(step.stepNumber)}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}

          {addingStep && (
            <div className="border border-blue-500/50 rounded-lg p-4 space-y-3 bg-blue-500/5">
              <div className="space-y-2">
                <Label>Action</Label>
                <TextareaWithAttachments
                  variant="glass"
                  value={newStep.action}
                  onChange={(value) =>
                    onNewStepChange({ ...newStep, action: value })
                  }
                  placeholder="Enter action"
                  fieldName="action"
                  attachments={newStepActionAttachments}
                  onAttachmentsChange={onNewStepActionAttachmentsChange || (() => {})}
                  entityType="teststep"
                  showAttachments={true}
                  maxLength={1000}
                  showCharCount={false}
                />
              </div>
              <div className="space-y-2">
                <Label>Expected Result</Label>
                <TextareaWithAttachments
                  variant="glass"
                  value={newStep.expectedResult}
                  onChange={(value) =>
                    onNewStepChange({ ...newStep, expectedResult: value })
                  }
                  placeholder="Enter expected result"
                  fieldName="expectedResult"
                  attachments={newStepExpectedResultAttachments}
                  onAttachmentsChange={onNewStepExpectedResultAttachmentsChange || (() => {})}
                  entityType="teststep"
                  showAttachments={true}
                  maxLength={1000}
                  showCharCount={false}
                />
              </div>
              <div className="flex gap-2">
                <ButtonPrimary size="sm" onClick={onAddStep} className="cursor-pointer">
                  Add
                </ButtonPrimary>
                <Button
                  size="sm"
                  variant="glass"
                  onClick={() => {
                    onAddingStepChange(false);
                    onNewStepChange({ action: '', expectedResult: '' });
                    if (onNewStepActionAttachmentsChange) {
                      onNewStepActionAttachmentsChange([]);
                    }
                    if (onNewStepExpectedResultAttachmentsChange) {
                      onNewStepExpectedResultAttachmentsChange([]);
                    }
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
    </DetailCard>
  );
}
