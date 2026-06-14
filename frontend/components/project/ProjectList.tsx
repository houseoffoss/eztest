'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { InfoBanner } from '@/frontend/reusable-components/alerts/InfoBanner';
import { ResponsiveGrid } from '@/frontend/reusable-components/layout/ResponsiveGrid';
import { Pagination } from '@/frontend/reusable-elements/pagination/Pagination';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '@/lib/pagination-config';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
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
  const [hasSelectedProject, setHasSelectedProject] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);

  // Compute permissions early for hooks
  const canCreateProject = hasPermissionCheck('projects:create');

  const navbarActions = useMemo(() => {
    const actions = [];
    
    if (canCreateProject) {
      actions.push({
        type: 'action' as const,
        label: '+ New Project',
        onClick: () => setTriggerCreateDialog(true),
        variant: 'primary' as const,
        buttonName: 'Project List - New Project',
      });
    }

    actions.push({
      type: 'signout' as const,
      showConfirmation: true,
    });

    return actions;
  }, [canCreateProject]);

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
    setCurrentPage(1);
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

  if (status === 'loading' || loading || permissionsLoading) {
    return <Loader fullScreen text="Loading projects..." />;
  }

  if (status === 'unauthenticated') {
    return null; // Will be redirected by useEffect
  }

  const totalPages = Math.max(1, Math.ceil(projects.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProjects = projects.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const handlePageChange = (page: number) => setCurrentPage(page);
  const handleItemsPerPageChange = (n: number) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  return (
    <>
      {/* Alert Messages */}
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />

      {/* Navbar */}
      <Navbar 
        brandLabel={null}
        items={[]}
        breadcrumbs={null}
        actions={navbarActions}
      />

      {/* Delete Dialog */}
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
            {paginatedProjects.map((project) => (
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

        {/* Pagination */}
        {projects.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={projects.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              itemsPerPageOptions={PAGE_SIZE_OPTIONS}
              showItemsPerPage={true}
            />
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
