'use client';

import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { DetailCard } from '@/components/design/DetailCard';
import { Input } from '@/elements/input';
import { Label } from '@/elements/label';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { TestStep } from '../types';

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
                        <Input
                          value={step.action}
                          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                            const updated = steps.map((s) =>
                              s.stepNumber === step.stepNumber
                                ? { ...s, action: e.target.value }
                                : s
                            );
                            onStepsChange(updated);
                          }}
                          placeholder="Enter action"
                        />
                      ) : (
                        <p className="text-white/90 break-words">{step.action}</p>
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-medium text-white/60 mb-1">
                        Expected Result
                      </h5>
                      {isEditing ? (
                        <Input
                          value={step.expectedResult}
                            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                              const updated = steps.map((s) =>
                                s.stepNumber === step.stepNumber
                                  ? { ...s, expectedResult: e.target.value }
                                  : s
                              );
                              onStepsChange(updated);
                            }}
                            placeholder="Enter expected result"
                          />
                        ) : (
                          <p className="text-white/90 break-words">{step.expectedResult}</p>
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
            <div className="border border-blue-500/50 rounded-lg p-4 space-y-3">
              <div className="space-y-2">
                <Label>Action</Label>
                <Input
                  variant="glass"
                  value={newStep.action}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    onNewStepChange({ ...newStep, action: e.target.value })
                  }
                  placeholder="Enter action"
                />
              </div>
              <div className="space-y-2">
                <Label>Expected Result</Label>
                <Input
                  variant="glass"
                  value={newStep.expectedResult}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    onNewStepChange({
                      ...newStep,
                      expectedResult: e.target.value,
                    })
                  }
                  placeholder="Enter expected result"
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
