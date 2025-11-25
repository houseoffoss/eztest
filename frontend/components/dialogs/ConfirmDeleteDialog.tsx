'use client';

import { Button } from '@/elements/button';
import { ButtonDestructive } from '@/elements/button-destructive';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/elements/dialog';

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
}

export function ConfirmDeleteDialog({
  open,
  title,
  description,
  itemName,
  isLoading = false,
  onOpenChange,
  onConfirm,
  cancelLabel = 'Cancel',
  confirmLabel = 'Delete',
}: ConfirmDeleteDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
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
          >
            {cancelLabel}
          </Button>
          <ButtonDestructive 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : confirmLabel}
          </ButtonDestructive>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
