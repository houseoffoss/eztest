'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/elements/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/elements/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/elements/dialog';
import { Input } from '@/elements/input';
import { Label } from '@/elements/label';
import { Textarea } from '@/elements/textarea';
import { Save, Trash2 } from 'lucide-react';
import { Navbar } from '@/components/design/Navbar';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';

interface Project {
  id: string;
  name: string;
  key: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

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

  useEffect(() => {
    if (project) {
      document.title = `Settings - ${project.name} | EZTest`;
    }
  }, [project]);

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
        headers: {
          'Content-Type': 'application/json',
        },
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
    return (
      <div className="min-h-screen bg-[#0a1628] p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading project...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a1628] p-8">
        <div className="max-w-4xl mx-auto">
          <Card variant="glass">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-white/70">Project not found</p>
              <Button onClick={() => router.push('/projects')} variant="glass-primary" className="mt-4">
                Back to Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar
        items={[
          { label: 'Overview', href: `/projects/${projectId}` },
          { label: 'Test Suites', href: `/projects/${projectId}/testsuites` },
          { label: 'Test Cases', href: `/projects/${projectId}/testcases` },
          { label: 'Test Runs', href: `/projects/${projectId}/testruns` },
          { label: 'Members', href: `/projects/${projectId}/members` },
          { label: 'Settings', href: `/projects/${projectId}/settings` },
        ]}
        breadcrumbs={
          <Breadcrumbs 
            items={[
              { label: 'Projects', href: '/projects' },
              { label: project.name, href: `/projects/${projectId}` },
              { label: 'Settings' }
            ]}
          />
        }
        actions={
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="glass-destructive" size="sm" className="px-5">
              Sign Out
            </Button>
          </form>
        }
      />
      
      {/* Page Header */}
      <div className="max-w-4xl mx-auto px-8 pt-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Project Settings</h1>
          <p className="text-white/70 text-sm">
            Manage project information and settings for <span className="font-semibold text-white">{project.name}</span>
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 pb-8 space-y-6">
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
                <Button
                  type="submit"
                  disabled={saving}
                  variant="glass-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
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
                  {new Date(project.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-white/60 text-xs">Last Updated</Label>
                <p className="text-sm font-medium text-white">
                  {new Date(project.updatedAt).toLocaleString()}
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
              <Button
                variant="glass-destructive"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleting}
                className="ml-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Project
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

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
                variant="glass"
                onClick={() => setDeleteDialogOpen(false)}
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
    </div>
  );
}
