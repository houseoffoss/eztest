'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

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
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchProject();
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
    if (!confirm(
      'Are you sure you want to delete this project?\n\n' +
      'This will permanently delete:\n' +
      '• All test cases\n' +
      '• All test runs\n' +
      '• All test suites\n' +
      '• All requirements\n' +
      '• All project data\n\n' +
      'This action cannot be undone!'
    )) {
      return;
    }

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
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-white p-8">
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
      <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-white p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-lg text-muted-foreground">Project not found</p>
              <Button onClick={() => router.push('/projects')} className="mt-4">
                Back to Projects
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f9ff] to-white">
      {/* Header */}
      <div className="border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/projects/${projectId}`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Project
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-[#033977] mb-2">Project Settings</h1>
            <p className="text-muted-foreground">
              Manage project information and settings for <span className="font-semibold">{project.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8 space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General Information</CardTitle>
            <CardDescription>
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  className="bg-gray-50 cursor-not-allowed"
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
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  {successMessage}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#033977] hover:bg-[#044a99]"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
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
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>
              Read-only project details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground text-xs">Created At</Label>
                <p className="text-sm font-medium">
                  {new Date(project.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Last Updated</Label>
                <p className="text-sm font-medium">
                  {new Date(project.updatedAt).toLocaleString()}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Project ID</Label>
                <p className="text-sm font-mono text-muted-foreground">{project.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
              <div>
                <h4 className="font-semibold text-red-900 mb-1">Delete this project</h4>
                <p className="text-sm text-red-700">
                  Once you delete a project, there is no going back. All data will be permanently deleted.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleting}
                className="ml-4"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleting ? 'Deleting...' : 'Delete Project'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
