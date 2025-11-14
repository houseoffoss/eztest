'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/design/Navbar';
import { Loader } from '@/components/ui/loader';
import { ProjectCard } from './subcomponents/ProjectCard';
import { CreateProjectDialog } from './subcomponents/CreateProjectDialog';
import { DeleteProjectDialog } from './subcomponents/DeleteProjectDialog';
import { EmptyProjectsState } from './subcomponents/EmptyProjectsState';
import { Project } from './types';

export default function ProjectList() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);
  const [createDialogKey, setCreateDialogKey] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects]);
  };

  const handleProjectDeleted = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    setProjectToDelete(null);
  };

  const openDeleteDialog = (project: Project) => {
    setProjectToDelete({ id: project.id, name: project.name });
    setDeleteDialogOpen(true);
  };

  const triggerCreateDialog = () => {
    setCreateDialogKey(prev => prev + 1);
  };

  if (loading) {
    return <Loader fullScreen text="Loading projects..." />;
  }

  return (
    <div className="min-h-screen bg-[#0a1628]">
      <Navbar
        items={[
          { label: 'Projects', href: '/projects' },
          { label: 'Runs', href: '/runs' },
        ]}
        actions={
          <form action="/api/auth/signout" method="POST">
            <Button type="submit" variant="glass-destructive" size="sm" className="px-5">
              Sign Out
            </Button>
          </form>
        }
      />
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-8 py-6 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
            <p className="text-white/70 text-sm">Manage your test projects and track progress</p>
          </div>
          <CreateProjectDialog key={createDialogKey} onProjectCreated={handleProjectCreated} />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        {projects.length === 0 ? (
          <EmptyProjectsState onCreateProject={triggerCreateDialog} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onNavigate={(path) => router.push(path)}
                onDelete={() => openDeleteDialog(project)}
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
    </div>
  );
}
