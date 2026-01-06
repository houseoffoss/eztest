'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { NotFoundState } from '@/frontend/reusable-components/errors/NotFoundState';
import { usePermissions } from '@/hooks/usePermissions';
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
  const { hasPermission: hasPermissionCheck } = usePermissions();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);
  
  const canDeleteProject = hasPermissionCheck('projects:delete');

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
      } else if (response.status === 404 || response.status === 403) {
        // Project not found or no access - redirect after showing message
        setAlert({
          type: 'error',
          title: 'Project Not Found',
          message: 'The project you\'re looking for doesn\'t exist or has been deleted. Redirecting...',
        });
        setTimeout(() => {
          router.push('/projects');
        }, 2000);
      } else {
        setAlert({
          type: 'error',
          title: 'Failed to Load Project',
          message: 'Could not load project details.',
        });
      }
    } catch {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'An error occurred while loading project.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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
        setAlert({
          type: 'success',
          title: 'Project Updated',
          message: 'Project settings have been saved successfully.',
        });
      } else {
        setAlert({
          type: 'error',
          title: 'Failed to Update',
          message: data.error || 'Failed to update project.',
        });
      }
    } catch {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'An error occurred. Please try again.',
      });
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
        setAlert({
          type: 'error',
          title: 'Failed to Delete',
          message: data.error || 'Failed to delete project.',
        });
        setDeleteDialogOpen(false);
      }
    } catch {
      setAlert({
        type: 'error',
        title: 'Error',
        message: 'An error occurred. Please try again.',
      });
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
      <NotFoundState
        title="Project Not Found"
        message="The project you're trying to configure doesn't exist or has been deleted."
        icon={Settings}
        redirectingMessage="Redirecting to projects page..."
        showRedirecting={true}
      />
    );
  }


  return (
    <>
      <SettingsHeader project={project} projectId={projectId} />

      <div className="px-8 pb-8">
        <div className="max-w-4xl mx-auto space-y-6 pt-0">
        <GeneralSettingsCard
          project={project}
          formData={formData}
          saving={saving}
          onFormChange={setFormData}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        <ProjectInfoCard project={project} />

        {canDeleteProject && (
          <DangerZoneCard
            project={project}
            deleting={deleting}
            onDelete={() => setDeleteDialogOpen(true)}
          />
        )}
        </div>
      </div>

      <DeleteProjectDialog
        open={deleteDialogOpen}
        projectName={project.name}
        deleting={deleting}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />

      {alert && (
        <FloatingAlert
          alert={alert}
          onClose={() => setAlert(null)}
        />
      )}
    </>
  );
}
