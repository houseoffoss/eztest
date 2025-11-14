'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DeleteProjectDialogProps {
  project: {
    id: string;
    name: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectDeleted: (projectId: string) => void;
}

export const DeleteProjectDialog = ({ project, open, onOpenChange, onProjectDeleted }: DeleteProjectDialogProps) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!project) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onProjectDeleted(project.id);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Project</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{project?.name}&quot;? This action cannot be undone.
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
              variant="glass"
              onClick={() => onOpenChange(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="glass-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete Project'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
