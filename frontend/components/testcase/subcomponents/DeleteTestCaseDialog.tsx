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
import { TestCase } from '../types';

interface DeleteTestCaseDialogProps {
  open: boolean;
  testCase: TestCase | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteTestCaseDialog({
  open,
  testCase,
  onOpenChange,
  onConfirm,
}: DeleteTestCaseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="glass">
        <DialogHeader>
          <DialogTitle>Delete Test Case</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{testCase?.title}&quot;?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="glass" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="glass-destructive" onClick={onConfirm}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
