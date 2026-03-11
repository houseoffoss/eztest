'use client';

import {
  BaseConfirmDialog,
  BaseConfirmDialogConfig,
} from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';
import { Defect } from '../types';

interface DeleteDefectDialogProps {
  open: boolean;
  defect: Defect | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function DeleteDefectDialog({
  open,
  defect,
  onOpenChange,
  onConfirm,
}: DeleteDefectDialogProps) {
  if (!defect) return null;

  const config: BaseConfirmDialogConfig = {
    title: 'Defectを削除',
    description: `Defect「${defect.defectId}: ${defect.title}」を削除してもよろしいですか？この操作は取り消せません。`,
    submitLabel: '削除',
    cancelLabel: 'キャンセル',
    triggerOpen: open,
    onOpenChange,
    onSubmit: onConfirm,
    destructive: true,
    dialogName: 'Delete Defect Dialog',
    submitButtonName: 'Delete Defect Dialog - Delete',
    cancelButtonName: 'Delete Defect Dialog - Cancel',
  };

  return <BaseConfirmDialog {...config} />;
}
