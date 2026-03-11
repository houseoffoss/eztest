'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Button } from "../../reusable-elements/buttons/Button";
import { ButtonDestructive } from "../../reusable-elements/buttons/ButtonDestructive";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../reusable-elements/dialogs/Dialog";
import { InlineError } from "../../reusable-elements/alerts/InlineError";

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
  /** Button name for analytics tracking (defaults to title) */
  dialogName?: string;
  submitButtonName?: string;
  cancelButtonName?: string;
}

export const BaseConfirmDialog = ({
  title,
  description,
  content,
  submitLabel = 'Confirm',
  cancelLabel = 'キャンセル',
  triggerOpen = false,
  onOpenChange,
  onSubmit,
  onSuccess,
  destructive = false,
  dialogName,
  submitButtonName,
  cancelButtonName,
}: BaseConfirmDialogConfig) => {
  const dialogTrackingName = dialogName || title;
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
              data-analytics-button={cancelButtonName || `${dialogTrackingName} - Cancel`}
            >
              {cancelLabel}
            </Button>
            {destructive ? (
              <ButtonDestructive
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="cursor-pointer"
                buttonName={submitButtonName || `${dialogTrackingName} - ${submitLabel}`}
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
                data-analytics-button={submitButtonName || `${dialogTrackingName} - ${submitLabel}`}
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

