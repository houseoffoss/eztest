'use client';

import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/components/design/BaseDialog';
import { useEffect, useState } from 'react';

interface Defect {
  id: string;
  defectId: string;
  title: string;
}

interface CreateDefectDialogProps {
  projectId: string;
  open?: boolean;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onDefectCreated: (defect: Defect) => void;
}

const SEVERITY_OPTIONS = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const PRIORITY_OPTIONS = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const DEFECT_TYPE_OPTIONS = [
  { value: 'BUG', label: 'Bug' },
  { value: 'IMPROVEMENT', label: 'Improvement' },
  { value: 'UI_ISSUE', label: 'UI Issue' },
  { value: 'BACKEND_ISSUE', label: 'Backend Issue' },
  { value: 'PERFORMANCE', label: 'Performance' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'DATA_ISSUE', label: 'Data Issue' },
  { value: 'OTHER', label: 'Other' },
];

export function CreateDefectDialog({
  projectId,
  triggerOpen,
  onOpenChange,
  onDefectCreated,
}: CreateDefectDialogProps) {
  const [assignees, setAssignees] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    const fetchAssignees = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}/members`);
        const data = await response.json();
        if (data.data) {
          setAssignees(
            data.data.map((member: { user: { id: string; name: string } }) => ({
              id: member.user.id,
              name: member.user.name,
            }))
          );
        }
      } catch (error) {
        console.error('Error fetching assignees:', error);
      }
    };
    fetchAssignees();
  }, [projectId]);

  const assigneeOptions = [
    { value: 'unassigned', label: 'Unassigned' },
    ...assignees.map((assignee) => ({
      value: assignee.id,
      label: assignee.name,
    })),
  ];

  const fields: BaseDialogField[] = [
    {
      name: 'title',
      label: 'Title',
      placeholder: 'Enter defect title',
      type: 'text',
      required: true,
      minLength: 5,
      maxLength: 200,
      cols: 2,
    },
    {
      name: 'severity',
      label: 'Severity',
      type: 'select',
      required: true,
      defaultValue: 'MEDIUM',
      options: SEVERITY_OPTIONS,
      cols: 1,
    },
    {
      name: 'priority',
      label: 'Priority',
      type: 'select',
      required: true,
      defaultValue: 'MEDIUM',
      options: PRIORITY_OPTIONS,
      cols: 1,
    },
    {
      name: 'defectType',
      label: 'Type',
      type: 'select',
      required: true,
      defaultValue: 'BUG',
      options: DEFECT_TYPE_OPTIONS,
      cols: 1,
    },
    {
      name: 'assignedToId',
      label: 'Assignee',
      type: 'select',
      placeholder: 'Select assignee',
      defaultValue: 'unassigned',
      options: assigneeOptions,
      cols: 1,
    },
    {
      name: 'environment',
      label: 'Environment',
      placeholder: 'e.g., Production, Staging, QA',
      type: 'text',
      maxLength: 100,
      cols: 1,
    },
    {
      name: 'testCaseId',
      label: 'Related Test Case ID (Optional)',
      placeholder: 'Enter test case ID if applicable',
      type: 'text',
      cols: 1,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Describe the defect...',
      rows: 3,
      cols: 2,
      maxLength: 2000,
    },
    {
      name: 'stepsToReproduce',
      label: 'Steps to Reproduce',
      type: 'textarea',
      placeholder: 'List the steps to reproduce the defect...',
      rows: 4,
      cols: 2,
      maxLength: 2000,
    },
    {
      name: 'expectedResult',
      label: 'Expected Result',
      type: 'textarea',
      placeholder: 'What should happen...',
      rows: 2,
      cols: 1,
      maxLength: 1000,
    },
    {
      name: 'actualResult',
      label: 'Actual Result',
      type: 'textarea',
      placeholder: 'What actually happens...',
      rows: 2,
      cols: 1,
      maxLength: 1000,
    },
  ];

  const config: BaseDialogConfig = {
    title: 'Create New Defect',
    description: 'Fill in the details to create a new defect. Status will be set to New by default.',
    fields,
    submitLabel: 'Create Defect',
    cancelLabel: 'Cancel',
    triggerOpen,
    onOpenChange,
    formPersistenceKey: `create-defect-${projectId}`,
    onSubmit: async (formData) => {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        severity: formData.severity,
        priority: formData.priority,
        defectType: formData.defectType,
        assignedToId: formData.assignedToId === 'unassigned' ? null : formData.assignedToId,
        environment: formData.environment || null,
        testCaseId: formData.testCaseId || null,
        stepsToReproduce: formData.stepsToReproduce || null,
        expectedResult: formData.expectedResult || null,
        actualResult: formData.actualResult || null,
        status: 'NEW', // Always start as NEW as per lifecycle requirements
      };

      const response = await fetch(`/api/projects/${projectId}/defects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create defect');
      }

      return data.data;
    },
    onSuccess: (result) => {
      if (result) {
        onDefectCreated(result as Defect);
      }
    },
  };

  return <BaseDialog {...config} />;
}
