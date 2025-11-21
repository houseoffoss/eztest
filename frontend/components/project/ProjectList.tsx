'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/elements/button';
import { Breadcrumbs } from '@/components/design/Breadcrumbs';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';
import { Loader } from '@/elements/loader';
import { ProjectCard } from './subcomponents/ProjectCard';
import { CreateProjectDialog } from './subcomponents/CreateProjectDialog';
import { DeleteProjectDialog } from './subcomponents/DeleteProjectDialog';
import { EmptyProjectsState } from './subcomponents/EmptyProjectsState';
import { Project } from './types';
import { usePermissions } from '@/hooks/usePermissions';

export default function ProjectList() {
  const router = useRouter();
  const { status } = useSession();
  const { hasPermission: hasPermissionCheck, isLoading: permissionsLoading } = usePermissions();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [triggerCreateDialog, setTriggerCreateDialog] = useState(false);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects();
    }
  }, [status]);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        setAlert({
          type: 'error',
          title: 'Failed to Load Projects',
          message: errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        });
        setProjects([]);
      } else {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setAlert({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      });
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
    setAlert({
      type: 'success',
      title: 'Success',
      message: `Project "${newProject.name}" created successfully`,
    });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleProjectDeleted = (projectId: string) => {
    const deletedProject = projects.find(p => p.id === projectId);
    setProjects(projects.filter(p => p.id !== projectId));
    setProjectToDelete(null);
    if (deletedProject) {
      setAlert({
        type: 'success',
        title: 'Success',
        message: `Project "${deletedProject.name}" deleted successfully`,
      });
      setTimeout(() => setAlert(null), 5000);
    }
  };

  const openDeleteDialog = (project: Project) => {
    setProjectToDelete({ id: project.id, name: project.name });
    setDeleteDialogOpen(true);
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  const handleCreateProject = () => {
    setTriggerCreateDialog(true);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTriggerCreateDialog(false);
    }
  };

  if (status === 'loading' || loading || permissionsLoading) {
    return <Loader fullScreen text="Loading..." />;
  }

  if (status === 'unauthenticated') {
    return null; // Will be redirected by useEffect
  }

  // Check if user can create projects
  const canCreateProject = hasPermissionCheck('projects:create');

  return (
    <>
      {/* Alert Messages */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      {/* Top Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/10">
        <div className="px-8 py-4">
          <div className="flex items-center justify-between">
            <Breadcrumbs 
              items={[
                { label: 'Projects' }
              ]}
            />
            <div className="flex items-center gap-3">
              {canCreateProject && (
                <Button onClick={() => setTriggerCreateDialog(true)} variant="glass-primary">
                  + New Project
                </Button>
              )}
              <Button 
                onClick={handleSignOut}
                variant="glass-destructive" 
                size="sm" 
                className="px-5"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-8 py-6 pt-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
              <p className="text-white/70 text-sm">Manage your test projects and track progress</p>
            </div>
          </div>
          <CreateProjectDialog triggerOpen={triggerCreateDialog} onProjectCreated={handleProjectCreated} onOpenChange={handleDialogOpenChange} />
        </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        {projects.length === 0 ? (
          <EmptyProjectsState onCreateProject={handleCreateProject} canCreateProject={canCreateProject} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onNavigate={(path) => router.push(path)}
                onDelete={() => openDeleteDialog(project)}
                canUpdate={hasPermissionCheck('projects:update')}
                canDelete={hasPermissionCheck('projects:delete')}
                canManageMembers={hasPermissionCheck('projects:manage_members')}
              />
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteProjectDialog
        project={projectToDelete}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onProjectDeleted={handleProjectDeleted}
      />
    </>
  );
}
