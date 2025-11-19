import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/elements/dialog';
import { Button } from '@/elements/button';

interface DeleteTestRunDialogProps {
  open: boolean;
  testRunName: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteTestRunDialog({
  open,
  testRunName,
  onOpenChange,
  onConfirm,
}: DeleteTestRunDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="glass">
        <DialogHeader>
          <DialogTitle>Delete Test Run</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{testRunName}&quot;? This will
            also delete all test results. This action cannot be undone.
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
