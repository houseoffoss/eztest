'use client';

import { useState, useEffect } from 'react';
import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/frontend/reusable-components/dialogs/BaseDialog';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';

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
      label: 'テストケースを選択',
      type: 'select',
      placeholder: 'リンクするテストケースを選択',
      required: true,
      options: testCaseOptions,
      cols: 2,
    },
  ];

  const config: BaseDialogConfig = {
    title: 'テストケースをリンク',
    description: 'Defectに関連する失敗を追跡するため、テストケースをリンクします。',
    fields,
    submitLabel: 'リンクする',
    cancelLabel: 'キャンセル',
    triggerOpen: open,
    onOpenChange,
    onSubmit: async (formData) => {
      const payload = {
        defectIds: [defectId],
      };

      const response = await fetch(
        `/api/projects/${projectId}/testcases/${formData.testCaseId}/defects`,
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
        title: 'リンクしました',
        message: 'テストケースがこのDefectに正常にリンクされました',
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
