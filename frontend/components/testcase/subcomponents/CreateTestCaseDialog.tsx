'use client';

import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/components/design/BaseDialog';
import { TestCase, TestSuite } from '../types';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../constants/testCaseFormConfig';

interface CreateTestCaseDialogProps {
  projectId: string;
  testSuites: TestSuite[];
  defaultSuiteId?: string;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTestCaseCreated: (testCase: TestCase) => void;
}

export function CreateTestCaseDialog({
  projectId,
  testSuites,
  defaultSuiteId,
  triggerOpen,
  onOpenChange,
  onTestCaseCreated,
}: CreateTestCaseDialogProps) {
  const suiteOptions = testSuites.map((suite) => ({
    value: suite.id,
    label: suite.name,
  }));

  const fields: BaseDialogField[] = [
    {
      name: 'title',
      label: 'Title',
      placeholder: 'Enter test case title',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 255,
      cols: 2,
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      defaultValue: 'MEDIUM',
      options: PRIORITY_OPTIONS.map(opt => ({ value: opt.value, label: opt.label })),
      cols: 1,
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      defaultValue: 'DRAFT',
      options: STATUS_OPTIONS.map(opt => ({ value: opt.value, label: opt.label })),
      cols: 1,
    },
    {
      name: 'suiteId',
      label: 'Test Suite',
      type: 'select',
      placeholder: 'Select a test suite',
      defaultValue: defaultSuiteId || 'none',
      options: [
        { value: 'none', label: 'None (No Suite)' },
        ...suiteOptions,
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
      type: 'textarea',
      placeholder: 'Enter test case description',
      rows: 3,
      cols: 2,
    },
    {
      name: 'preconditions',
      label: 'Preconditions',
      type: 'textarea',
      placeholder: 'Enter preconditions',
      rows: 2,
      cols: 1,
    },
    {
      name: 'postconditions',
      label: 'Postconditions',
      type: 'textarea',
      placeholder: 'Enter postconditions',
      rows: 2,
      cols: 1,
    },
    {
      name: 'expectedResult',
      label: 'Expected Result',
      type: 'textarea',
      placeholder: 'Enter the expected result or outcome',
      rows: 3,
      cols: 2,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    const estimatedTime = formData.estimatedTime ? parseInt(formData.estimatedTime) : undefined;

    const response = await fetch(`/api/projects/${projectId}/testcases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: formData.title,
        description: formData.description || undefined,
        expectedResult: formData.expectedResult || undefined,
        priority: formData.priority,
        status: formData.status,
        estimatedTime,
        preconditions: formData.preconditions || undefined,
        postconditions: formData.postconditions || undefined,
        suiteId: formData.suiteId !== 'none' ? formData.suiteId : undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create test case');
    }

    return data.data;
  };

  const config: BaseDialogConfig<TestCase> = {
    title: 'Create Test Case',
    description: 'Add a new test case to this project. Fill in the details to get started.',
    fields,
    submitLabel: 'Create Test Case',
    cancelLabel: 'Cancel',
    triggerOpen,
    onOpenChange,
    onSubmit: handleSubmit,
    onSuccess: (testCase) => {
      if (testCase) {
        onTestCaseCreated(testCase);
      }
    },
  };

  return <BaseDialog {...config} />;
}

export type { CreateTestCaseDialogProps };
