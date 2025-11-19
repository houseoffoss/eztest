'use client';

import { Button } from '@/elements/button';
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
      <DialogContent variant="glass">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {itemName ? description.replace('{item}', `"${itemName}"`) : description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="glass" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button 
            variant="glass-destructive" 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
