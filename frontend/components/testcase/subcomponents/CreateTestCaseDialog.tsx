'use client';

import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/frontend/reusable-components/dialogs/BaseDialog';
import { TestCase, Module } from '../types';
import { useEffect, useState } from 'react';
import { attachmentStorage } from '@/lib/attachment-storage';
import type { Attachment } from '@/lib/s3';
import { uploadFileToS3 } from '@/lib/s3';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { TestStep } from '../detail/types';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Textarea } from '@/frontend/reusable-elements/textareas/Textarea';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Plus, Trash2 } from 'lucide-react';

interface CreateTestCaseDialogProps {
  projectId: string;
  defaultModuleId?: string;
  open?: boolean;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTestCaseCreated: (testCase: TestCase) => void;
}

export function CreateTestCaseDialog({
  projectId,
  defaultModuleId,
  open,
  triggerOpen,
  onOpenChange,
  onTestCaseCreated,
}: CreateTestCaseDialogProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [descriptionAttachments, setDescriptionAttachments] = useState<Attachment[]>([]);
  // TODO: Uncomment for future use - Expected Result field at test case level
  // const [expectedResultAttachments, setExpectedResultAttachments] = useState<Attachment[]>([]);
  const [preconditionsAttachments, setPreconditionsAttachments] = useState<Attachment[]>([]);
  const [postconditionsAttachments, setPostconditionsAttachments] = useState<Attachment[]>([]);
  const [steps, setSteps] = useState<TestStep[]>([]);
  const [newStep, setNewStep] = useState<{ action: string; expectedResult: string }>({
    action: '',
    expectedResult: '',
  });

  // Fetch dynamic dropdown options
  const { options: priorityOptions } = useDropdownOptions('TestCase', 'priority');
  const { options: statusOptions } = useDropdownOptions('TestCase', 'status');

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/modules`);
        const data = await response.json();
        if (data.data) {
          setModules(data.data);
        }
      } catch (error) {
        console.error('Error fetching modules:', error);
      }
    };
    
    fetchModules();
    
    // Set attachment context when dialog opens
    if (open !== false) {
      attachmentStorage.setContext({
        entityType: 'testcase',
        projectId,
      });
    }
    
    return () => {
      // Clear context when dialog closes
      if (open === false) {
        attachmentStorage.clearContext();
      }
    };
  }, [projectId, open]);

  const moduleOptions = modules.map(module => ({
    value: module.id,
    label: module.name,
  }));

  const fields: BaseDialogField[] = [
    {
      name: 'title',
      label: 'Title',
      placeholder: 'Enter test case title',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 200,
      cols: 2,
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      defaultValue: 'MEDIUM',
      options: priorityOptions.map(opt => ({ value: opt.value, label: opt.label })),
      cols: 1,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      defaultValue: 'DRAFT',
      options: statusOptions.map(opt => ({ value: opt.value, label: opt.label })),
      cols: 1,
    },
    {
      name: 'moduleId',
      label: 'Module',
      type: 'select',
      placeholder: 'Select a module',
      defaultValue: defaultModuleId || 'none',
      options: [
        { value: 'none', label: 'None (No Module)' },
        ...moduleOptions,
      ],
      cols: 1,
    },
    {
      name: 'estimatedTime',
      label: 'Estimated Time (minutes)',
      type: 'number',
      placeholder: 'Enter estimated time',
      cols: 1,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea-with-attachments',
      placeholder: 'Enter test case description',
      rows: 3,
      cols: 1,
      attachments: descriptionAttachments,
      onAttachmentsChange: setDescriptionAttachments,
    },
    // TODO: Uncomment for future use - Expected Result field at test case level
    // {
    //   name: 'expectedResult',
    //   label: 'Expected Result',
    //   type: 'textarea-with-attachments',
    //   placeholder: 'Enter the expected result',
    //   rows: 3,
    //   cols: 1,
    //   attachments: expectedResultAttachments,
    //   onAttachmentsChange: setExpectedResultAttachments,
    // },
    {
      name: 'preconditions',
      label: 'Preconditions',
      type: 'textarea-with-attachments',
      placeholder: 'Enter preconditions',
      rows: 3,
      cols: 1,
      attachments: preconditionsAttachments,
      onAttachmentsChange: setPreconditionsAttachments,
    },
    {
      name: 'postconditions',
      label: 'Postconditions',
      type: 'textarea-with-attachments',
      placeholder: 'Enter postconditions',
      rows: 3,
      cols: 1,
      attachments: postconditionsAttachments,
      onAttachmentsChange: setPostconditionsAttachments,
    },
    {
      name: 'testData',
      label: 'Test Data',
      type: 'textarea',
      placeholder: 'Enter test data or input values',
      rows: 3,
      cols: 1,
    },
    {
      name: 'steps',
      label: 'Test Steps',
      type: 'custom',
      cols: 2,
      customRender: () => (
        <DetailCard
          title="Test Steps"
          contentClassName="space-y-3"
        >
          <div className="space-y-3">
            {steps.length === 0 ? (
              <p className="text-white/60 text-center py-4">
                No test steps defined yet. Add steps to break down this test case.
              </p>
            ) : (
              steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="border border-white/10 rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-semibold text-blue-500">
                        {step.stepNumber}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label className="text-xs font-medium text-white/60 mb-1">
                            Action
                          </Label>
                          <Textarea
                            value={step.action}
                            onChange={(e) =>
                              handleStepChange(step.stepNumber, 'action', e.target.value)
                            }
                            placeholder="Enter action"
                            rows={3}
                            className="bg-[#101a2b]/70 border border-white/15 text-white/90"
                          />
                        </div>
                        <div>
                          <Label className="text-xs font-medium text-white/60 mb-1">
                            Expected Result
                          </Label>
                          <Textarea
                            value={step.expectedResult}
                            onChange={(e) =>
                              handleStepChange(
                                step.stepNumber,
                                'expectedResult',
                                e.target.value,
                              )
                            }
                            placeholder="Enter expected result"
                            rows={3}
                            className="bg-[#101a2b]/70 border border-white/15 text-white/90"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 cursor-pointer hover:bg-red-400/10 hover:text-red-400"
                      onClick={() => handleRemoveStep(step.stepNumber)}
                      type="button"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))
            )}

            <div className="border border-blue-500/50 rounded-lg p-4 space-y-3 bg-blue-500/5">
              <div className="space-y-2">
                <Label>Action</Label>
                <Textarea
                  value={newStep.action}
                  onChange={(e) =>
                    setNewStep((prev) => ({ ...prev, action: e.target.value }))
                  }
                  placeholder="Enter action"
                  rows={3}
                  className="bg-[#101a2b]/70 border border-white/25 text-white/90"
                />
              </div>
              <div className="space-y-2">
                <Label>Expected Result</Label>
                <Textarea
                  value={newStep.expectedResult}
                  onChange={(e) =>
                    setNewStep((prev) => ({ ...prev, expectedResult: e.target.value }))
                  }
                  placeholder="Enter expected result"
                  rows={3}
                  className="bg-[#101a2b]/70 border border-white/25 text-white/90"
                />
              </div>
              <div className="flex justify-end">
                <ButtonPrimary
                  size="sm"
                  onClick={handleAddStep}
                  className="cursor-pointer"
                  type="button"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Step
                </ButtonPrimary>
              </div>
            </div>
          </div>
        </DetailCard>
      ),
    },
  ];

  const uploadPendingAttachments = async (): Promise<Array<{ id?: string; s3Key: string; fileName: string; mimeType: string; fieldName?: string }>> => {
    const allAttachments = [
      ...descriptionAttachments,
      // TODO: Uncomment for future use - Expected Result attachments
      // ...expectedResultAttachments,
      ...preconditionsAttachments,
      ...postconditionsAttachments,
    ];

    const pendingAttachments = allAttachments.filter((att) => att.id.startsWith('pending-'));
    
    if (pendingAttachments.length === 0) {
      return []; // No pending attachments
    }

    const uploadedAttachments: Array<{ id?: string; s3Key: string; fileName: string; mimeType: string; fieldName?: string }> = [];

    // Upload all pending files
    for (const attachment of pendingAttachments) {
      // @ts-expect-error - Access the pending file object
      const file = attachment._pendingFile;
      if (!file) continue;

      try {
        const result = await uploadFileToS3({
          file,
          fieldName: attachment.fieldName || 'attachment',
          entityType: 'testcase',
          projectId,
          onProgress: () => {}, // Silent upload
        });

        if (!result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        // Store the uploaded attachment info for linking
        if (result.attachment) {
          uploadedAttachments.push({
            id: result.attachment.id, // Use the database ID
            s3Key: result.attachment.filename,
            fileName: file.name,
            mimeType: file.type,
            fieldName: attachment.fieldName,
          });
        }
      } catch (error) {
        console.error('Failed to upload attachment:', error);
        throw error; // Throw error to stop test case creation
      }
    }

    return uploadedAttachments;
  };

  const handleSubmit = async (formData: Record<string, string>) => {
    // Upload all pending attachments first
    const uploadedAttachments = await uploadPendingAttachments();

    const estimatedTime = formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined;

    // Build full list of steps including any unsaved step currently in the editor
    const pendingStepHasContent =
      newStep.action.trim().length > 0 || newStep.expectedResult.trim().length > 0;

    const allStepsForSubmit = pendingStepHasContent
      ? [
          ...steps,
          {
            stepNumber: steps.length + 1,
            action: newStep.action,
            expectedResult: newStep.expectedResult,
          },
        ]
      : steps;

    // Clean and normalize steps before sending to API
    const cleanedSteps = allStepsForSubmit
      .map((step, index) => ({
        stepNumber: index + 1,
        action: step.action.trim(),
        expectedResult: step.expectedResult.trim(),
      }))
      .filter((step) => step.action.length > 0 || step.expectedResult.length > 0);

    const response = await fetch(`/api/projects/${projectId}/testcases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: formData.title,
        description: formData.description || undefined,
        // TODO: Uncomment for future use - Expected Result at test case level
        // expectedResult: formData.expectedResult || undefined,
        testData: formData.testData || undefined,
        priority: formData.priority,
        status: formData.status,
        estimatedTime,
        preconditions: formData.preconditions || undefined,
        postconditions: formData.postconditions || undefined,
        moduleId: formData.moduleId !== 'none' ? formData.moduleId : undefined,
        steps: cleanedSteps.length > 0 ? cleanedSteps : undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create test case');
    }

    const createdTestCase = data.data;

    // Associate uploaded attachments with the test case
    if (uploadedAttachments.length > 0) {
      try {
        const attachmentResponse = await fetch(`/api/projects/${projectId}/testcases/${createdTestCase.id}/attachments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ attachments: uploadedAttachments }),
        });
        
        if (!attachmentResponse.ok) {
          const errorData = await attachmentResponse.json();
          console.error('Failed to associate attachments:', errorData);
          throw new Error('Failed to link attachments to test case');
        }
        
        await attachmentResponse.json();

        // TODO: Uncomment for future use - Link expectedResult attachments to first step
        // If there's an expectedResult with attachments, also link them to the first step
        // This follows the same pattern as expectedResult text - it's saved at test case level
        // and displayed in the first step, so attachments should also be associated with the first step
        // const expectedResultAttachmentsToLink = uploadedAttachments.filter(
        //   (att) => att.fieldName === 'expectedResult'
        // );

        // if (expectedResultAttachmentsToLink.length > 0 && formData.expectedResult) {
        //   try {
        //     // Fetch the test case with steps to check if there's a first step
        //     const testCaseResponse = await fetch(`/api/testcases/${createdTestCase.id}`);
        //     if (testCaseResponse.ok) {
        //       const testCaseData = await testCaseResponse.json();
        //       const steps = testCaseData.data?.steps || [];
        //       
        //       // If there's a first step, link expectedResult attachments to it
        //       // This mirrors how expectedResult text is handled - it's shown in the first step
        //       if (steps.length > 0 && steps[0]?.id) {
        //         const firstStepId = steps[0].id;
        //         const stepAttachmentResponse = await fetch(`/api/teststeps/${firstStepId}/attachments`, {
        //           method: 'POST',
        //           headers: { 'Content-Type': 'application/json' },
        //           body: JSON.stringify({ attachments: expectedResultAttachmentsToLink }),
        //         });
        //         
        //         if (!stepAttachmentResponse.ok) {
        //           console.warn('Failed to link expectedResult attachments to first step, but test case attachments are saved');
        //         }
        //       }
        //     }
        //   } catch (error) {
        //     // Non-critical error - attachments are already linked to test case
        //     console.warn('Error linking expectedResult attachments to step:', error);
        //   }
        // }
      } catch (error) {
        console.error('Error associating attachments:', error);
        throw new Error('Failed to link attachments. Test case was created but attachments were not saved.');
      }
    }

    return createdTestCase;
  };

  const config: BaseDialogConfig<TestCase> = {
    title: 'Create Test Case',
    description: 'Add a new test case to this project. Fill in the details to get started.',
    fields,
    submitLabel: 'Create Test Case',
    cancelLabel: 'Cancel',
    triggerOpen: open !== undefined ? open : triggerOpen,
    onOpenChange,
    onSubmit: handleSubmit,
    projectId,
    onSuccess: (testCase) => {
      if (testCase) {
        onTestCaseCreated(testCase);
        // Clear attachments after successful creation
        attachmentStorage.clearAllAttachments();
        attachmentStorage.clearContext();
      }
    },
    submitButtonName: 'Create Test Case Dialog - Create Test Case',
    cancelButtonName: 'Create Test Case Dialog - Cancel',
  };

  const handleAddStep = () => {
    const trimmedAction = newStep.action.trim();
    const trimmedExpectedResult = newStep.expectedResult.trim();

    if (!trimmedAction && !trimmedExpectedResult) {
      return;
    }

    setSteps((prev) => {
      const nextStepNumber = prev.length + 1;
      return [
        ...prev,
        {
          stepNumber: nextStepNumber,
          action: trimmedAction,
          expectedResult: trimmedExpectedResult,
        },
      ];
    });

    setNewStep({ action: '', expectedResult: '' });
  };

  const handleRemoveStep = (stepNumber: number) => {
    setSteps((prev) => {
      const filtered = prev.filter((step) => step.stepNumber !== stepNumber);
      return filtered.map((step, index) => ({
        ...step,
        stepNumber: index + 1,
      }));
    });
  };

  const handleStepChange = (
    stepNumber: number,
    field: 'action' | 'expectedResult',
    value: string,
  ) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.stepNumber === stepNumber ? { ...step, [field]: value } : step,
      ),
    );
  };

  return <BaseDialog {...config} />;
}

export type { CreateTestCaseDialogProps };
