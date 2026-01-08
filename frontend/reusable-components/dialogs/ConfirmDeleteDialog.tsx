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
import { useAnalytics } from '@/hooks/useAnalytics';
import { useEffect, useRef } from 'react';

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
  cancelLabel = 'Cancel',
  confirmLabel = 'Delete',
  dialogName,
}: ConfirmDeleteDialogProps) {
  const { trackDialog, trackForm } = useAnalytics();
  const wasOpenedRef = useRef(false);
  const dialogTrackingName = dialogName || title;

  // Track dialog open/close
  useEffect(() => {
    if (open && !wasOpenedRef.current) {
      wasOpenedRef.current = true;
      trackDialog('opened', dialogTrackingName, description).catch(console.error);
    } else if (!open && wasOpenedRef.current) {
      wasOpenedRef.current = false;
      trackDialog('closed', dialogTrackingName, description).catch(console.error);
    }
  }, [open, dialogTrackingName, description, trackDialog]);

  const handleConfirm = async () => {
    try {
      await onConfirm();
      // Track successful deletion
      trackForm(dialogTrackingName, true, 'Delete confirmed').catch(console.error);
    } catch (error) {
      // Track failed deletion
      const errorMsg = error instanceof Error ? error.message : 'Delete failed';
      trackForm(dialogTrackingName, false, errorMsg).catch(console.error);
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

