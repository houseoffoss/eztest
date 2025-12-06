'use client';

import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/components/design/BaseDialog';
import { useEffect, useState } from 'react';
import { SearchableSelect } from '@/elements/searchable-select';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';
import React from 'react';

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
  // Context-specific props for auto-population
  testCaseId?: string; // When creating from test run with failed test case
  testRunEnvironment?: string; // When creating from test run, auto-populate environment
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

export function CreateDefectDialog({
  projectId,
  triggerOpen,
  onOpenChange,
  onDefectCreated,
  testCaseId,
  testRunEnvironment,
}: CreateDefectDialogProps) {
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);
  const [assignees, setAssignees] = useState<Array<{ id: string; name: string }>>([]);
  const [testCases, setTestCases] = useState<Array<{ id: string; testCaseId: string; title: string }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch assignees
        const assigneesResponse = await fetch(`/api/projects/${projectId}/members`);
        const assigneesData = await assigneesResponse.json();
        if (assigneesData.data) {
          setAssignees(
            assigneesData.data.map((member: { user: { id: string; name: string } }) => ({
              id: member.user.id,
              name: member.user.name,
            }))
          );
        }

        // Fetch test cases for the project
        const testCasesResponse = await fetch(`/api/projects/${projectId}/testcases`);
        const testCasesData = await testCasesResponse.json();
        
        if (testCasesData.data && Array.isArray(testCasesData.data)) {
          const mappedTestCases = testCasesData.data.map((tc: { id: string; tcId: string; title: string }) => ({
            id: tc.id,
            testCaseId: tc.tcId, // Use tcId from database
            title: tc.title,
          }));
          setTestCases(mappedTestCases);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [projectId]);

  // Convert test cases to SearchableSelect options (for searchable dropdown)
  const testCaseOptions = testCases.map(tc => ({
    id: tc.id,
    label: tc.testCaseId,
    subtitle: tc.title,
  }));

  const assigneeOptions = assignees.map((assignee) => ({
    value: assignee.id,
    label: assignee.name,
  }));

  const ENVIRONMENT_OPTIONS = [
    { value: 'Production', label: 'Production' },
    { value: 'Staging', label: 'Staging' },
    { value: 'QA', label: 'QA' },
    { value: 'Development', label: 'Development' },
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
      cols: 1,
    },
    // Test Case field - searchable select when from defect list, text input when from test run
    ...(testCaseId ? [{
      name: 'testCaseId',
      label: 'Test Case (Auto-populated)',
      type: 'text' as const,
      defaultValue: testCaseId,
      readOnly: true,
      cols: 1,
      placeholder: testCases.find(tc => tc.id === testCaseId) 
        ? `${testCases.find(tc => tc.id === testCaseId)!.testCaseId} - ${testCases.find(tc => tc.id === testCaseId)!.title}`
        : 'Loading test case...',
    }] : [{
      name: 'testCaseId',
      label: 'Test Case (Optional)',
      type: 'custom' as const,
      cols: 1,
      customRender: (value: string, onChange: (value: string) => void) => (
        <SearchableSelect
          options={testCaseOptions}
          value={value}
          onValueChange={onChange}
          label=""
          id="testCaseSearch"
          searchPlaceholder="Search by TC-ID or title..."
          emptyMessage="No test cases found matching"
          maxResults={10}
        />
      ),
    }]),
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
      name: 'assignedToId',
      label: 'Assignee',
      type: 'select',
      placeholder: 'Select assignee',
      options: assigneeOptions,
      cols: 1,
    },
    // Environment field - dropdown if from defect list, auto-populated if from test run
    {
      name: 'environment',
      label: testRunEnvironment ? 'Environment (Auto-populated)' : 'Environment',
      type: testRunEnvironment ? 'text' : 'select',
      placeholder: testRunEnvironment ? testRunEnvironment : 'Select environment',
      defaultValue: testRunEnvironment,
      options: testRunEnvironment ? undefined : ENVIRONMENT_OPTIONS,
      readOnly: !!testRunEnvironment,
      maxLength: 100,
      cols: 1,
    },
    {
      name: 'dueDate',
      label: 'Due Date (optional)',
      type: 'date',
      cols: 1,
    },
    {
      name: 'progressPercentage',
      label: 'Progress % (optional)',
      type: 'number',
      placeholder: '0-100',
      min: 0,
      max: 100,
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
  ];

  const handleDialogOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  const config: BaseDialogConfig = {
    title: 'Create New Defect',
    description: 'Fill in the details to create a new defect. Status will be set to New by default.',
    fields,
    submitLabel: 'Create Defect',
    cancelLabel: 'Cancel',
    triggerOpen,
    onOpenChange: handleDialogOpenChange,
    formPersistenceKey: `create-defect-${projectId}`,
    onSubmit: async (formData) => {
      // Get test case ID from form data
      const finalTestCaseId = formData.testCaseId || null;
      
      const payload = {
        title: formData.title,
        description: formData.description || null,
        severity: formData.severity,
        priority: formData.priority,
        assignedToId: formData.assignedToId && formData.assignedToId.trim() !== '' ? formData.assignedToId : null,
        environment: formData.environment && formData.environment.trim() !== '' ? formData.environment : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate as string).toISOString() : undefined,
        progressPercentage: formData.progressPercentage ? Number(formData.progressPercentage) : undefined,
        status: 'NEW', // Always start as NEW as per lifecycle requirements
        testCaseIds: finalTestCaseId ? [finalTestCaseId] : undefined, // Link test case during creation
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
        const defect = result as Defect;
        setAlert({
          type: 'success',
          title: 'Defect Created',
          message: `Defect ${defect.defectId} has been created successfully`,
        });
        onDefectCreated(defect);
      }
    },
  };

  return (
    <>
      <BaseDialog {...config} />
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
    </>
  );
}
