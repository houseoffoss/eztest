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
      <p className="font-semibold mb-2">This action will:</p>
      <ul className="list-disc list-inside space-y-1">
        <li>Remove this member&apos;s access to the project</li>
        <li>Revoke their permissions immediately</li>
        <li>This can be reversed by re-adding the member</li>
      </ul>
    </div>
  );

  const config: BaseConfirmDialogConfig = {
    title: 'Remove Team Member',
    description: `Are you sure you want to remove ${member.name} from this project?`,
    content,
    submitLabel: 'Remove',
    cancelLabel: 'Cancel',
    triggerOpen,
    onOpenChange,
    onSubmit: onConfirm,
    destructive: true,
  };

  return <BaseConfirmDialog {...config} />;
}
