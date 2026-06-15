'use client';

import { BaseConfirmDialog, BaseConfirmDialogConfig } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';
import { Module } from '../types';

interface DeleteModuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  module: Module;
  testCaseCount: number;
  onConfirm: () => Promise<void>;
}

export function DeleteModuleDialog({
  open,
  onOpenChange,
  module,
  testCaseCount,
  onConfirm,
}: DeleteModuleDialogProps) {
  const content = (
    <div className="space-y-3">
      <div className="glass-panel p-4 rounded-lg">
        <p className="text-sm text-white/80 mb-2">
          <span className="font-semibold">Модуль:</span> {module.name}
        </p>
        {module.description && (
          <p className="text-sm text-white/60 mb-2 break-words line-clamp-2">{module.description}</p>
        )}
        <p className="text-sm text-white/80">
          <span className="font-semibold">Тест-кейсы:</span> {testCaseCount}
        </p>
      </div>

      {testCaseCount > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <p className="text-sm text-yellow-200">
            <strong>Внимание:</strong> Этот модуль содержит {testCaseCount} 
            {testCaseCount !== 1 ? 'тест-кейсов' : 'тест-кейс'}. При удалении модуля
            связь с модулем у этих тест-кейсов будет удалена, но сами тест-кейсы
            останутся.
          </p>
        </div>
      )}

      <p className="text-sm text-white/60">
        Это действие нельзя отменить. Модуль будет безвозвратно удален из проекта.
      </p>
    </div>
  );

  const config: BaseConfirmDialogConfig = {
    title: 'Удалить модуль',
    description: `Вы уверены, что хотите удалить «${module.name}»?`,
    content,
    submitLabel: 'Удалить модуль',
    cancelLabel: 'Отмена',
    triggerOpen: open,
    onOpenChange,
    onSubmit: onConfirm,
    destructive: true,
    dialogName: 'Delete Module Dialog',
    submitButtonName: 'Delete Module Dialog - Delete Module',
    cancelButtonName: 'Delete Module Dialog - Cancel',
  };

  return <BaseConfirmDialog {...config} />;
}
