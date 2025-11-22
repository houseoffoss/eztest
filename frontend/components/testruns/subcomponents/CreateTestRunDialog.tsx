'use client';

import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/components/design/BaseDialog';
import { TestRun } from '../types';
import { ENVIRONMENT_OPTIONS } from '../constants/testRunFormConfig';

interface CreateTestRunDialogProps {
  projectId: string;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onTestRunCreated: (testRun: TestRun) => void;
}

export function CreateTestRunDialog({
  projectId,
  triggerOpen,
  onOpenChange,
  onTestRunCreated,
}: CreateTestRunDialogProps) {
  const fields: BaseDialogField[] = [
    {
      name: 'name',
      label: 'Test Run Name',
      placeholder: 'E.g., Login Feature - Build #123',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 255,
      cols: 2,
    },
    {
      name: 'environment',
      label: 'Environment',
      type: 'select',
      placeholder: 'Select environment',
      required: true,
      defaultValue: 'none',
      options: [
        { value: 'none', label: 'Select environment' },
        ...ENVIRONMENT_OPTIONS.map(opt => ({ value: opt.value, label: opt.label })),
      ],
      cols: 2,
    },
    {
      name: 'description',
      label: 'Description',
      placeholder: 'Enter test run description',
      type: 'textarea',
      rows: 3,
      cols: 2,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    // Validate environment is selected
    if (formData.environment === 'none' || !formData.environment) {
      throw new Error('Environment is required');
    }

    const response = await fetch(`/api/projects/${projectId}/testruns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        description: formData.description || undefined,
        environment: formData.environment,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to create test run');
    }

    return data.data;
  };

  const config: BaseDialogConfig<TestRun> = {
    title: 'Create Test Run',
    description: 'Create a new test run to execute test cases and track results.',
    fields,
    submitLabel: 'Create Test Run',
    cancelLabel: 'Cancel',
    triggerOpen,
    onOpenChange,
    onSubmit: handleSubmit,
    onSuccess: (testRun) => {
      if (testRun) {
        onTestRunCreated(testRun);
      }
    },
  };

  return <BaseDialog {...config} />;
}

export type { CreateTestRunDialogProps };
