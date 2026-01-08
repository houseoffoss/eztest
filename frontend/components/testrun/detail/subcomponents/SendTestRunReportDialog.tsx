'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/frontend/reusable-elements/dialogs/Dialog';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { Loader2 } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface SendTestRunReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
}

export function SendTestRunReportDialog({
  open,
  onOpenChange,
  onConfirm,
}: SendTestRunReportDialogProps) {
  const { trackDialog, trackForm } = useAnalytics();
  const wasOpenedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Track dialog open/close
  useEffect(() => {
    if (open && !wasOpenedRef.current) {
      wasOpenedRef.current = true;
      trackDialog('opened', 'Send Test Run Report Dialog', 'Send test run report via email').catch(console.error);
    } else if (!open && wasOpenedRef.current) {
      wasOpenedRef.current = false;
      trackDialog('closed', 'Send Test Run Report Dialog', 'Send test run report via email').catch(console.error);
    }
  }, [open, trackDialog]);

  const handleConfirm = async () => {
    setError('');
    setIsLoading(true);
    try {
      await onConfirm();
      // Track successful confirmation
      trackForm('Send Test Run Report Dialog', true, 'Report sent successfully').catch(console.error);
      onOpenChange(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send report';
      // Track failed confirmation
      trackForm('Send Test Run Report Dialog', false, errorMessage).catch(console.error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Test Run Report</DialogTitle>
          <DialogDescription>
            Would you like to send the test run report via email to admin, project managers, and defect assignees?
          </DialogDescription>
        </DialogHeader>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex gap-3 justify-end pt-4">
          <Button
            variant="glass"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            buttonName="Send Test Run Report Dialog - Cancel"
          >
            No
          </Button>
          <ButtonPrimary
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex items-center gap-2"
            buttonName="Send Test Run Report Dialog - Send Report"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? 'Sending...' : 'Yes, Send Report'}
          </ButtonPrimary>
        </div>
      </DialogContent>
    </Dialog>
  );
}

