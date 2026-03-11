'use client';

import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/frontend/reusable-elements/dialogs/Dialog';
import { ReactNode } from 'react';

export interface CreateDialogProps {
  open: boolean;
  title: string;
  description?: string;
  isLoading?: boolean;
  children: ReactNode;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  cancelLabel?: string;
  confirmLabel?: string;
}

export function CreateDialog({
  open,
  title,
  description,
  isLoading = false,
  children,
  onOpenChange,
  onConfirm,
  cancelLabel = 'キャンセル',
  confirmLabel = 'Create',
}: CreateDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {children}
        </div>
        
        <DialogFooter>
          <Button 
            variant="glass" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <ButtonPrimary 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : confirmLabel}
          </ButtonPrimary>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

