'use client';

import { BaseConfirmDialog, BaseConfirmDialogConfig } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';

interface RemoveMemberDialogProps {
  member: { id: string; name: string } | null;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export type { RemoveMemberDialogProps };

/**
 * Reusable dialog for removing project members
 * Uses BaseConfirmDialog pattern for consistency with test suite and test case delete dialogs
 */
export function RemoveMemberDialog({
  member,
  triggerOpen,
  onOpenChange,
  onConfirm,
}: RemoveMemberDialogProps) {
  if (!member) return null;

  const content = (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
      <p className="font-semibold mb-2">この操作により:</p>
      <ul className="list-disc list-inside space-y-1">
        <li>このメンバーのプロジェクトへのアクセスが削除されます</li>
        <li>権限は即座に失効します</li>
        <li>メンバーを再度追加すれば元に戻せます</li>
      </ul>
    </div>
  );

  const config: BaseConfirmDialogConfig = {
    title: 'チームメンバーを削除',
    description: `${member.name} をこのプロジェクトから削除してもよろしいですか？`,
    content,
    submitLabel: '削除',
    cancelLabel: 'キャンセル',
    triggerOpen,
    onOpenChange,
    onSubmit: onConfirm,
    destructive: true,
  };

  return <BaseConfirmDialog {...config} />;
}
