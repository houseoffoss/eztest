'use client';

import { useState, useEffect } from 'react';
import { BaseDialog, BaseDialogField, BaseDialogConfig } from '@/frontend/reusable-components/dialogs/BaseDialog';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';

interface LinkDefectDialogProps {
  projectId: string;
  testCaseId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDefectLinked: () => void;
  alreadyLinkedDefectIds: string[];
}

interface Defect {
  id: string;
  defectId: string;
  title: string;
}

export function LinkDefectDialog({
  projectId,
  testCaseId,
  open,
  onOpenChange,
  onDefectLinked,
  alreadyLinkedDefectIds,
}: LinkDefectDialogProps) {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  useEffect(() => {
    if (open) {
      fetchDefects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId]);

  const fetchDefects = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}/defects`);
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data)) {
        // Filter out already linked defects
        const availableDefects = data.data
          .filter((defect: Defect) => !alreadyLinkedDefectIds.includes(defect.id))
          .map((defect: Defect) => ({
            id: defect.id,
            defectId: defect.defectId,
            title: defect.title,
          }));
        setDefects(availableDefects);
      }
    } catch (error) {
      console.error('Error fetching defects:', error);
    }
  };

  const defectOptions = defects.map((defect) => ({
    value: defect.id,
    label: `${defect.defectId} - ${defect.title}`,
  }));

  const fields: BaseDialogField[] = [
    {
      name: 'defectId',
      label: 'Select Defect',
      type: 'select',
      placeholder: 'Choose a defect to link',
      required: true,
      options: defectOptions,
      cols: 2,
    },
  ];

  const config: BaseDialogConfig = {
    title: 'Link Defect',
    description: 'Link a defect to this test case to track related issues.',
    fields,
    submitLabel: 'Link Defect',
    cancelLabel: 'Cancel',
    triggerOpen: open,
    onOpenChange,
    onSubmit: async (formData) => {
      const payload = {
        defectIds: [formData.defectId],
      };

      const response = await fetch(
        `/api/testcases/${testCaseId}/defects`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link defect');
      }

      return data;
    },
    onSuccess: () => {
      setAlert({
        type: 'success',
        title: 'Defect Linked',
        message: 'The defect has been successfully linked to this test case',
      });
      onDefectLinked();
    },
  };

  return (
    <>
      <BaseDialog {...config} />
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
    </>
  );
}

