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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
      setDefects([]);
      fetchDefects();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, projectId]);

  const fetchDefects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/projects/${projectId}/defects`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch defects: ${response.statusText}`);
      }
      
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
        
        if (availableDefects.length === 0) {
          setError('No available defects to link. All defects are already linked to this test case.');
        }
      } else {
        setError('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error fetching defects:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load defects. Please try again.';
      setError(errorMessage);
      setAlert({
        type: 'error',
        title: 'Error Loading Defects',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
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
      placeholder: loading ? 'Loading defects...' : error ? 'Error loading defects' : defectOptions.length === 0 ? 'No defects available' : 'Choose a defect to link',
      required: true,
      options: defectOptions,
      cols: 2,
    },
  ];

  const config: BaseDialogConfig = {
    title: 'Link Defect',
    description: error 
      ? error 
      : loading 
        ? 'Loading available defects...' 
        : defectOptions.length === 0
          ? 'No available defects to link. All defects are already linked to this test case.'
          : 'Link a defect to this test case to track related issues.',
    fields,
    submitLabel: 'Link Defect',
    cancelLabel: 'Cancel',
    triggerOpen: open,
    onOpenChange,
    onSubmit: async (formData) => {
      // Prevent submission if no defects available or if loading/error
      if (loading || error || defectOptions.length === 0) {
        throw new Error('Cannot link defect: No available defects or error occurred');
      }

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

