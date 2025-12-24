'use client';

import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/frontend/reusable-elements/dialogs/Dialog';

interface DeleteProjectDialogProps {
  open: boolean;
  projectName: string;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function DeleteProjectDialog({
  open,
  projectName,
  deleting,
  onOpenChange,
  onConfirm,
}: DeleteProjectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{projectName}&quot;? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-red-300">
            <p className="font-semibold mb-2">This will permanently delete:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>All test cases</li>
              <li>All test runs</li>
              <li>All test suites</li>
              <li>All requirements</li>
              <li>All project data</li>
            </ul>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <ButtonDestructive
              type="button"
              onClick={onConfirm}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Project'}
            </ButtonDestructive>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
