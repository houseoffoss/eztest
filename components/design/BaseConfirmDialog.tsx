'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/elements/button';
import { ButtonDestructive } from '@/elements/button-destructive';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/elements/dialog';
import { InlineError } from '@/components/design/InlineError';

export interface BaseConfirmDialogConfig {
  title: string;
  description?: string;
  content?: ReactNode; // Custom content to display
  submitLabel?: string;
  cancelLabel?: string;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: () => Promise<void>;
  onSuccess?: () => void;
  destructive?: boolean; // Changes button color to red
}

export const BaseConfirmDialog = ({
  title,
  description,
  content,
  submitLabel = 'Confirm',
  cancelLabel = 'Cancel',
  triggerOpen = false,
  onOpenChange,
  onSubmit,
  onSuccess,
  destructive = false,
}: BaseConfirmDialogConfig) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (triggerOpen) {
      setOpen(true);
    }
  }, [triggerOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    try {
      await onSubmit();
      handleOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent variant="confirm">
        <DialogHeader className="mb-5">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription className="mt-2">{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-5">
          {content && <div>{content}</div>}
          <InlineError message={error} />
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="glass"
              onClick={() => handleOpenChange(false)}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
            {destructive ? (
              <ButtonDestructive
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="cursor-pointer"
              >
                {loading ? `${submitLabel}...` : submitLabel}
              </ButtonDestructive>
            ) : (
              <Button
                type="button"
                variant="glass"
                onClick={handleSubmit}
                disabled={loading}
                className="cursor-pointer"
              >
                {loading ? `${submitLabel}...` : submitLabel}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
