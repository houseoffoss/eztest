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
          <span className="font-semibold">Module:</span> {module.name}
        </p>
        {module.description && (
          <p className="text-sm text-white/60 mb-2 break-words line-clamp-2">{module.description}</p>
        )}
        <p className="text-sm text-white/80">
          <span className="font-semibold">Test Cases:</span> {testCaseCount}
        </p>
      </div>

      {testCaseCount > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
          <p className="text-sm text-yellow-200">
            <strong>Warning:</strong> This module contains {testCaseCount} test case
            {testCaseCount !== 1 ? 's' : ''}. Deleting the module will remove the module
            association from these test cases, but the test cases themselves will not be
            deleted.
          </p>
        </div>
      )}

      <p className="text-sm text-white/60">
        This action cannot be undone. The module will be permanently removed from the project.
      </p>
    </div>
  );

  const config: BaseConfirmDialogConfig = {
    title: 'Delete Module',
    description: `Are you sure you want to delete "${module.name}"?`,
    content,
    submitLabel: 'Delete Module',
    cancelLabel: 'Cancel',
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
