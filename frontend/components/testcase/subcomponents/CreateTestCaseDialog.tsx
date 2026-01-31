'use client';

import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/frontend/reusable-components/dialogs/BaseDialog';
import { TestCase, Module, Platform } from '../types';
import React, { useEffect, useState } from 'react';
import { attachmentStorage } from '@/lib/attachment-storage';
import type { Attachment } from '@/lib/s3';
import { uploadFileToS3 } from '@/lib/s3';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { PlatformsCheckboxGroup } from './PlatformsCheckboxGroup';

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
      name: 'assertionId',
      label: 'Assertion-ID',
      type: 'text',
      placeholder: 'Enter assertion ID',
      cols: 1,
    },
    {
      name: 'rtcId',
      label: 'RTC-ID',
      type: 'text',
      placeholder: 'Enter RTC ID',
      cols: 1,
    },
    {
      name: 'flowId',
      label: 'Flow-ID',
      type: 'text',
      placeholder: 'Enter flow ID',
      cols: 1,
    },
    {
      name: 'layer',
      label: 'Layer',
      type: 'select',
      placeholder: 'Select layer',
      options: [
        { value: 'SMOKE', label: 'Smoke' },
        { value: 'CORE', label: 'Core' },
        { value: 'EXTENDED', label: 'Extended' },
        { value: 'UNKNOWN', label: 'Unknown' },
      ],
      cols: 1,
    },
    {
      name: 'targetType',
      label: '対象',
      type: 'select',
      placeholder: 'Select target type',
      options: [
        { value: 'API', label: 'API' },
        { value: 'SCREEN', label: '画面' },
        { value: 'FUNCTIONAL', label: 'Functional' },
        { value: 'NON_FUNCTIONAL', label: 'Non-Functional' },
        { value: 'PERFORMANCE', label: 'Performance' },
        { value: 'SECURITY', label: 'Security' },
        { value: 'USABILITY', label: 'Usability' },
        { value: 'COMPATIBILITY', label: 'Compatibility' },
      ],
      cols: 1,
    },
    {
      name: 'testType',
      label: 'テスト種別',
      type: 'select',
      placeholder: 'テスト種別を選択',
      options: [
        { value: 'NORMAL', label: '正常系' },
        { value: 'ABNORMAL', label: '異常系' },
        { value: 'NON_FUNCTIONAL', label: '非機能' },
        { value: 'REGRESSION', label: '回帰' },
        { value: 'DATA_INTEGRITY', label: 'データ整合性確認' },
        { value: 'STATE_TRANSITION', label: '状態遷移確認' },
        { value: 'OPERATIONAL', label: '運用確認' },
        { value: 'FAILURE', label: '障害時確認' },
      ],
      cols: 1,
    },
    {
      name: 'isAutomated',
      label: '自動化',
      type: 'custom',
      customRender: (value: string, onChange: (value: string) => void) => (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isAutomated"
            checked={value === 'true'}
            onChange={(e) => onChange(e.target.checked ? 'true' : 'false')}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="isAutomated" className="text-sm font-medium text-gray-700">
            自動化テスト
          </label>
        </div>
      ),
      cols: 1,
    },
    {
      name: 'platforms',
      label: '環境',
      type: 'custom',
      customRender: (value: string, onChange: (value: string) => void) => {
        let platforms: Platform[] = [];
        if (value) {
          try {
            platforms = JSON.parse(value);
          } catch {
            // If not JSON, treat as empty array
            platforms = [];
          }
        }
        return (
          <PlatformsCheckboxGroup
            values={platforms}
            onChange={(vals) => onChange(JSON.stringify(vals))}
          />
        );
      },
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
      name: 'evidence',
      label: '根拠',
      type: 'textarea',
      placeholder: 'Enter evidence',
      rows: 3,
      cols: 1,
    },
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
      name: 'notes',
      label: '備考',
      type: 'textarea',
      placeholder: 'Enter notes',
      rows: 3,
      cols: 1,
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
    const isAutomated = formData.isAutomated === 'true';
    // Parse platforms from JSON string or use array directly
    let platforms: Platform[] = [];
    if (formData.platforms) {
      if (typeof formData.platforms === 'string') {
        try {
          // Try parsing as JSON first
          platforms = JSON.parse(formData.platforms);
        } catch {
          // If not JSON, treat as comma-separated string (fallback)
          platforms = formData.platforms.split(',').map(p => p.trim()).filter(p => p.length > 0) as Platform[];
        }
      } else if (Array.isArray(formData.platforms)) {
        platforms = formData.platforms as Platform[];
      }
    }

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
        // New fields
        assertionId: formData.assertionId || undefined,
        rtcId: formData.rtcId || undefined,
        flowId: formData.flowId || undefined,
        layer: formData.layer || undefined,
        targetType: formData.targetType || undefined,
        testType: formData.testType || undefined,
        evidence: formData.evidence || undefined,
        notes: formData.notes || undefined,
        isAutomated,
        platforms: platforms.length > 0 ? platforms : undefined,
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
        const attachmentResponse = await fetch(`/api/testcases/${createdTestCase.id}/attachments`, {
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

  return <BaseDialog {...config} />;
}

export type { CreateTestCaseDialogProps };
