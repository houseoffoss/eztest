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
  if (!testCase) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Test Case</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{testCase.title}&quot;? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <ButtonDestructive onClick={onConfirm}>
            Delete
          </ButtonDestructive>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
