/**
 * EXAMPLE: How to use the BaseDialog component
 * 
 * The BaseDialog is a fully configurable, reusable dialog that handles:
 * - Dynamic form fields
 * - Form submission
 * - Error handling
 * - Loading states
 * - Success callbacks
 */

import { BaseDialog, BaseDialogConfig, BaseDialogField } from '@/components/utils/BaseDialog';

// Example 1: Create a project dialog
export function CreateProjectDialogExample() {
  const fields: BaseDialogField[] = [
    {
      name: 'name',
      label: 'Project Name',
      placeholder: 'E-Commerce Platform',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 255,
    },
    {
      name: 'key',
      label: 'Project Key',
      placeholder: 'ECOM',
      type: 'text',
      required: true,
      minLength: 2,
      maxLength: 10,
      pattern: '[A-Z0-9]+',
    },
    {
      name: 'description',
      label: 'Description',
      placeholder: 'Brief description...',
      type: 'textarea',
      rows: 3,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.name,
        key: formData.key.toUpperCase(),
        description: formData.description || undefined,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create project');
    }

    return data.data;
  };

  const config: BaseDialogConfig = {
    title: 'Create New Project',
    description: 'Set up a new project to organize your test cases and test runs.',
    fields,
    submitLabel: 'Create Project',
    onSubmit: handleSubmit,
    onSuccess: () => {
      console.log('Project created successfully!');
      // Refresh projects list, etc.
    },
  };

  return <BaseDialog {...config} />;
}

// Example 2: Create a test suite dialog
export function CreateTestSuiteDialogExample() {
  const fields: BaseDialogField[] = [
    {
      name: 'name',
      label: 'Suite Name',
      placeholder: 'Authentication Tests',
      type: 'text',
      required: true,
      minLength: 3,
      maxLength: 255,
    },
    {
      name: 'description',
      label: 'Description',
      placeholder: 'Describe this test suite...',
      type: 'textarea',
      rows: 3,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    // Implementation
  };

  return (
    <BaseDialog
      title="Create Test Suite"
      description="Add a new test suite to organize your test cases."
      fields={fields}
      submitLabel="Create Suite"
      onSubmit={handleSubmit}
    />
  );
}

// Example 3: User management dialog
export function InviteUserDialogExample() {
  const fields: BaseDialogField[] = [
    {
      name: 'email',
      label: 'Email Address',
      placeholder: 'user@example.com',
      type: 'email',
      required: true,
    },
    {
      name: 'role',
      label: 'Role',
      placeholder: 'Select role',
      type: 'text',
      required: true,
    },
  ];

  const handleSubmit = async (formData: Record<string, string>) => {
    // Implementation
  };

  return (
    <BaseDialog
      title="Invite User"
      description="Add a new team member to your project."
      fields={fields}
      submitLabel="Send Invite"
      onSubmit={handleSubmit}
    />
  );
}
