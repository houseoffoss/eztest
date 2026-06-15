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
        throw new Error(errorData.error || `Не удалось загрузить дефекты: ${response.statusText}`);
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
        
        // Don't set error for empty results - these are informational, not errors
        // The UI will handle empty state gracefully
        setError(null);
      } else {
        setError('Invalid response format from server');
        setAlert({
          type: 'error',
          title: 'Ошибка загрузки дефектов',
          message: 'Некорректный формат ответа сервера',
        });
      }
    } catch (error) {
      console.error('Error fetching defects:', error);
      const errorMessage = error instanceof Error ? error.message : 'Не удалось загрузить дефекты. Попробуйте снова.';
      setError(errorMessage);
      setAlert({
        type: 'error',
        title: 'Ошибка загрузки дефектов',
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
      label: 'Выберите дефект',
      type: 'select',
      placeholder: loading ? 'Загрузка дефектов...' : error ? 'Ошибка загрузки дефектов' : defectOptions.length === 0 ? 'Нет доступных дефектов' : 'Выберите дефект для привязки',
      required: true,
      options: defectOptions,
      cols: 2,
    },
  ];

  const config: BaseDialogConfig = {
    title: 'Связать дефект',
    description: error 
      ? error 
      : loading 
        ? 'Загрузка доступных дефектов...' 
        : defectOptions.length === 0
          ? 'В этом проекте нет доступных дефектов. Сначала создайте дефекты, затем привяжите их к тест-кейсам.'
          : 'Привяжите дефект к этому тест-кейсу для отслеживания связанных проблем.',
    fields,
    submitLabel: 'Связать дефект',
    cancelLabel: 'Отмена',
    triggerOpen: open,
    onOpenChange,
    onSubmit: async (formData) => {
      // Prevent submission if loading, has error, or no defects available
      if (loading || error || defectOptions.length === 0) {
        throw new Error('Невозможно привязать дефект: нет доступных дефектов или произошла ошибка');
      }

      const payload = {
        defectIds: [formData.defectId],
      };

      const response = await fetch(
        `/api/projects/${projectId}/testcases/${testCaseId}/defects`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Не удалось привязать дефект');
      }

      return data;
    },
    onSuccess: () => {
      setAlert({
        type: 'success',
        title: 'Дефект привязан',
        message: 'Дефект успешно привязан к этому тест-кейсу',
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

