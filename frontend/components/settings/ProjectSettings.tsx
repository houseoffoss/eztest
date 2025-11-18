'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/elements/button';
import { Card, CardContent } from '@/elements/card';
import { Navbar } from '@/components/design/Navbar';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import { Project, ProjectFormData } from './types';
import { SettingsHeader } from './subcomponents/SettingsHeader';
import { GeneralSettingsCard } from './subcomponents/GeneralSettingsCard';
import { ProjectInfoCard } from './subcomponents/ProjectInfoCard';
import { DangerZoneCard } from './subcomponents/DangerZoneCard';
import { DeleteProjectDialog } from './subcomponents/DeleteProjectDialog';

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

  const [formData, setFormData] = useState<ProjectFormData>({
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

  const handleCancel = () => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
      });
      setError('');
      setSuccessMessage('');
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
      <div className="min-h-screen bg-[#0a1628]">
        <Navbar
          items={[]}
          breadcrumbs={<Breadcrumbs items={[]} />}
          actions={
            <form action="/api/auth/signout" method="POST">
              <Button
                type="submit"
                variant="glass-destructive"
                size="sm"
                className="px-5"
              >
                Sign Out
              </Button>
            </form>
          }
        />
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-white/70">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a1628]">
        <Navbar
          items={[]}
          breadcrumbs={<Breadcrumbs items={[]} />}
          actions={
            <form action="/api/auth/signout" method="POST">
              <Button
                type="submit"
                variant="glass-destructive"
                size="sm"
                className="px-5"
              >
                Sign Out
              </Button>
            </form>
          }
        />
        <div className="max-w-4xl mx-auto p-8">
          <Card variant="glass">
            <CardContent className="p-8 text-center">
              <p className="text-lg text-white/70">Project not found</p>
              <Button
                onClick={() => router.push('/projects')}
                variant="glass-primary"
                className="mt-4"
              >
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
              { label: 'Settings' },
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

      <SettingsHeader project={project} />

      <div className="max-w-4xl mx-auto px-8 pb-8 space-y-6">
        <GeneralSettingsCard
          project={project}
          formData={formData}
          saving={saving}
          error={error}
          successMessage={successMessage}
          onFormChange={setFormData}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        <ProjectInfoCard project={project} />

        <DangerZoneCard
          project={project}
          deleting={deleting}
          onDelete={() => setDeleteDialogOpen(true)}
        />
      </div>

      <DeleteProjectDialog
        open={deleteDialogOpen}
        projectName={project.name}
        deleting={deleting}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </div>
  );
}
