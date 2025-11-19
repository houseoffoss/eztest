import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/elements/dialog';
import { Button } from '@/elements/button';

interface DeleteTestSuiteDialogProps {
  open: boolean;
  testSuiteName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteTestSuiteDialog({
  open,
  testSuiteName,
  onOpenChange,
  onConfirm,
}: DeleteTestSuiteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="glass">
        <DialogHeader>
          <DialogTitle>Delete Test Suite</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{testSuiteName}&quot;? Test
            cases in this suite will not be deleted, but will become unorganized.
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
