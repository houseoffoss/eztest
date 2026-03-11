'use client';

import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/frontend/reusable-elements/dialogs/Dialog';

export interface ConfirmDeleteDialogProps {
  open: boolean;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  cancelLabel?: string;
  confirmLabel?: string;
  /** Button name for analytics tracking (defaults to title) */
  dialogName?: string;
}

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  itemName,
  isLoading = false,
  onOpenChange,
  onConfirm,
  cancelLabel = 'キャンセル',
  confirmLabel = '削除',
  dialogName,
}: ConfirmDeleteDialogProps) {
  const dialogTrackingName = dialogName || title;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      throw error;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {itemName ? description.replace('{item}', `"${itemName}"`) : description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            data-analytics-button={`${dialogTrackingName} - Cancel`}
          >
            {cancelLabel}
          </Button>
          <ButtonDestructive 
            onClick={handleConfirm}
            disabled={isLoading}
            buttonName={`${dialogTrackingName} - ${confirmLabel}`}
          >
            {isLoading ? 'Deleting...' : confirmLabel}
          </ButtonDestructive>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

