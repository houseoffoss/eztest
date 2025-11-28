'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDateTime } from '@/lib/date-utils';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { ButtonDestructive } from '@/elements/button-destructive';
import { Loader } from '@/elements/loader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/elements/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/elements/dialog';
import { Input } from '@/elements/input';
import { Label } from '@/elements/label';
import { Textarea } from '@/elements/textarea';
import { Save, Trash2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  key: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectSettingsProps {
  projectId: string;
}

export default function ProjectSettings({ projectId }: ProjectSettingsProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.data);
        setFormData({
          name: data.data.name,
          description: data.data.description || '',
        });
      } else {
        setError('Failed to load project');
      }
    } catch {
      setError('An error occurred while loading project');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProject(data.data);
        setSuccessMessage('Project updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Failed to update project');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/projects?deleted=true');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete project');
        setDeleteDialogOpen(false);
      }
    } catch {
      setError('An error occurred. Please try again.');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen text="Loading project settings..." />;
  }

  if (!project) {
    return (
      <Card variant="glass">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-white/70">Project not found</p>
          <ButtonPrimary onClick={() => router.push('/projects')} className="mt-4">
            Back to Projects
          </ButtonPrimary>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-white">General Information</CardTitle>
          <CardDescription className="text-white/70">
            Update your project name and description
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, name: e.target.value })}
                required
                minLength={3}
                maxLength={255}
                placeholder="E-Commerce Platform"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="key">Project Key</Label>
              <Input
                id="key"
                value={project.key}
                disabled
                className="bg-white/5 border-white/10 text-white/50 cursor-not-allowed backdrop-blur-none"
              />
              <p className="text-xs text-muted-foreground">
                Project key cannot be changed after creation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Brief description of the project..."
              />
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="text-sm text-green-400 bg-green-400/10 border border-green-400/20 p-3 rounded-md">
                {successMessage}
              </div>
            )}

            <div className="flex gap-3">
              <ButtonPrimary type="submit" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </ButtonPrimary>
              <Button
                type="button"
                variant="glass"
                onClick={() => {
                  setFormData({
                    name: project.name,
                    description: project.description || '',
                  });
                  setError('');
                  setSuccessMessage('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Project Information */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-white">Project Information</CardTitle>
          <CardDescription className="text-white/70">
            Read-only project details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white/60 text-xs">Created At</Label>
              <p className="text-sm font-medium text-white">
                {formatDateTime(project.createdAt)}
              </p>
            </div>
            <div>
              <Label className="text-white/60 text-xs">Last Updated</Label>
              <p className="text-sm font-medium text-white">
                {formatDateTime(project.updatedAt)}
              </p>
            </div>
            <div>
              <Label className="text-white/60 text-xs">Project ID</Label>
              <p className="text-sm font-mono text-white/80">{project.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card variant="glass" className="border-red-400/30">
        <CardHeader>
          <CardTitle className="text-red-400">Danger Zone</CardTitle>
          <CardDescription className="text-red-300/70">
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-400/20 rounded-lg bg-red-400/5">
            <div>
              <h4 className="font-semibold text-red-300 mb-1">Delete this project</h4>
              <p className="text-sm text-red-300/70">
                Once you delete a project, there is no going back. All data will be permanently deleted.
              </p>
            </div>
            <ButtonDestructive
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting}
              className="ml-4"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Project
            </ButtonDestructive>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
                variant="ghost"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <ButtonDestructive
                type="button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Project'}
              </ButtonDestructive>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
