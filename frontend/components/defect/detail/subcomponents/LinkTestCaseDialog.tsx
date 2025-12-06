'use client';

import { useState, useEffect } from 'react';
import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/components/design/BaseDialog';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';

interface LinkTestCaseDialogProps {
  projectId: string;
  defectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTestCaseLinked: () => void;
  alreadyLinkedTestCaseIds: string[];
}

interface TestCase {
  id: string;
  tcId: string;
  title: string;
}

export function LinkTestCaseDialog({
  projectId,
  defectId,
  open,
  onOpenChange,
  onTestCaseLinked,
  alreadyLinkedTestCaseIds,
}: LinkTestCaseDialogProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  useEffect(() => {
    if (open) {
      fetchTestCases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId]);

  const fetchTestCases = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/testcases`);
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        // Filter out already linked test cases
        const availableTestCases = data.data
          .filter((tc: TestCase) => !alreadyLinkedTestCaseIds.includes(tc.id))
          .map((tc: TestCase) => ({
            id: tc.id,
            tcId: tc.tcId,
            title: tc.title,
          }));
        setTestCases(availableTestCases);
      }
    } catch (error) {
      console.error('Error fetching test cases:', error);
    }
  };

  const testCaseOptions = testCases.map((tc) => ({
    value: tc.id,
    label: `${tc.tcId} - ${tc.title}`,
  }));

  const fields: BaseDialogField[] = [
    {
      name: 'testCaseId',
      label: 'Select Test Case',
      type: 'select',
      placeholder: 'Choose a test case to link',
      required: true,
      options: testCaseOptions,
      cols: 2,
    },
  ];

  const config: BaseDialogConfig = {
    title: 'Link Test Case',
    description: 'Link a test case to this defect to track related failures.',
    fields,
    submitLabel: 'Link Test Case',
    cancelLabel: 'Cancel',
    triggerOpen: open,
    onOpenChange,
    onSubmit: async (formData) => {
      const payload = {
        defectIds: [defectId],
      };

      const response = await fetch(
        `/api/testcases/${formData.testCaseId}/defects`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link test case');
      }

      return data;
    },
    onSuccess: () => {
      setAlert({
        type: 'success',
        title: 'Test Case Linked',
        message: 'The test case has been successfully linked to this defect',
      });
      onTestCaseLinked();
    },
  };

  return (
    <>
      <BaseDialog {...config} />
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
    </>
  );
}
