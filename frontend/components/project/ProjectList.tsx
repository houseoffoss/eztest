'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { InfoBanner } from '@/frontend/reusable-components/alerts/InfoBanner';
import { ResponsiveGrid } from '@/frontend/reusable-components/layout/ResponsiveGrid';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { ProjectCard } from './subcomponents/ProjectCard';
import { CreateProjectDialog } from './subcomponents/CreateProjectDialog';
import { DeleteProjectDialog } from './subcomponents/DeleteProjectDialog';
import { EmptyProjectsState } from './subcomponents/EmptyProjectsState';
import { Project } from './types';
import { usePermissions } from '@/hooks/usePermissions';
import { BaseConfirmDialog } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';
import { LogOut } from 'lucide-react';
import { clearAllPersistedForms } from '@/hooks/useFormPersistence';

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
  const [hasSelectedProject, setHasSelectedProject] = useState(false);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

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

  // Check if user came from a project page (has project context in sessionStorage)
  useEffect(() => {
    const lastProjectId = sessionStorage.getItem('lastProjectId');
    setHasSelectedProject(!!lastProjectId);
  }, []);

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

  const handleCreateProject = () => {
    setTriggerCreateDialog(true);
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTriggerCreateDialog(false);
    }
  };

  const handleSignOut = async () => {
    // Clear all persisted form data before signing out
    clearAllPersistedForms();
    // Clear project context from session storage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('lastProjectId');
      // Clear any other project-related session data
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('defects-filters-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
    await signOut({ callbackUrl: '/auth/login', redirect: true });
  };

  if (status === 'loading' || loading || permissionsLoading) {
    return <Loader fullScreen text="Loading projects..." />;
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

      {/* Navbar */}
      <Navbar 
        brandLabel={null}
        items={[]}
        breadcrumbs={null}
        actions={
          <div className="flex items-center gap-2">
            {canCreateProject && (
              <ButtonPrimary 
                onClick={() => setTriggerCreateDialog(true)} 
                className="cursor-pointer"
                buttonName="Project List - New Project"
              >
                + New Project
              </ButtonPrimary>
            )}
            <ButtonDestructive 
              type="button" 
              size="default" 
              className="px-5 cursor-pointer flex-shrink-0 flex items-center gap-2"
              onClick={() => setSignOutDialogOpen(true)}
              buttonName="Project List - Sign Out"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </ButtonDestructive>
          </div>
        }
      />

      <BaseConfirmDialog
        title="Sign Out"
        description="Are you sure you want to sign out? You will need to log in again to access your account."
        submitLabel="Sign Out"
        cancelLabel="Cancel"
        triggerOpen={signOutDialogOpen}
        onOpenChange={setSignOutDialogOpen}
        onSubmit={handleSignOut}
        destructive={true}
      />
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-8 py-6 pt-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
              <p className="text-white/70 text-sm">Manage your test projects and track progress</p>
            </div>
          </div>
          
          {/* Info Banner - Only show when no project has been selected */}
          {projects.length > 0 && !hasSelectedProject && (
            <InfoBanner
              message="Select a project below to view test suites, test cases, and manage testing activities."
              variant="info"
              className="mb-6"
            />
          )}
          
          <CreateProjectDialog triggerOpen={triggerCreateDialog} onProjectCreated={handleProjectCreated} onOpenChange={handleDialogOpenChange} />
        </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        {projects.length === 0 ? (
          <EmptyProjectsState onCreateProject={handleCreateProject} canCreateProject={canCreateProject} />
        ) : (
          <ResponsiveGrid
            columns={{ default: 1, md: 2, lg: 3 }}
            gap="md"
          >
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
          </ResponsiveGrid>
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
