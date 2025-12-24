'use client';

import { BaseConfirmDialog, BaseConfirmDialogConfig } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';

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
  const content = (
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
  );

  const handleSubmit = async () => {
    if (!project) return;

    const response = await fetch(`/api/projects/${project.id}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || 'Failed to delete project');
    }
  };

  const config: BaseConfirmDialogConfig = {
    title: 'Delete Project',
    description: `Are you sure you want to delete "${project?.name}"? This action cannot be undone.`,
    content,
    submitLabel: 'Delete Project',
    cancelLabel: 'Cancel',
    triggerOpen: open,
    onOpenChange,
    onSubmit: handleSubmit,
    onSuccess: () => {
      if (project) {
        onProjectDeleted(project.id);
      }
    },
    destructive: true,
  };

  return <BaseConfirmDialog {...config} />;
};
