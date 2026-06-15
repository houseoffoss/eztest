'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { TestTube2, Play, FileText, Folder, Bug, LogOut } from 'lucide-react';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { Breadcrumbs, type BreadcrumbItem } from '@/frontend/reusable-components/layout/Breadcrumbs';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { ResponsiveGrid } from '@/frontend/reusable-components/layout/ResponsiveGrid';
import { ClickableStatCard } from '@/frontend/reusable-components/cards/ClickableStatCard';
import { NotFoundState } from '@/frontend/reusable-components/errors/NotFoundState';
import { BaseConfirmDialog } from '@/frontend/reusable-components/dialogs/BaseConfirmDialog';
import { ProjectHeader } from './subcomponents/ProjectHeader';
import { ProjectDetail as ProjectDetailType } from './types';
import { clearAllPersistedForms } from '@/hooks/useFormPersistence';

type Project = ProjectDetailType;

interface ProjectDetailProps {
  projectId: string;
}

export default function ProjectDetail({ projectId }: ProjectDetailProps) {
  const router = useRouter();
  const { status } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `${project.name} | EZTest`;
    }
  }, [project]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${projectId}?stats=true`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.data);
      } else if (response.status === 404 || response.status === 403) {
        // Project not found or no access - redirect after showing message
        setTimeout(() => {
          router.push('/projects');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return <Loader fullScreen text="Загрузка проекта..." />;
  }

  if (!project) {
    return (
      <NotFoundState
        title="Проект не найден"
        message="Проект, который вы ищете, не существует или был удален."
        icon={Folder}
        redirectingMessage="Перенаправление на страницу проектов..."
        showRedirecting={true}
      />
    );
  }

  return (
    <>
      {/* Navbar */}
      <Navbar 
        brandLabel={null}
        items={[]}
        breadcrumbs={
          <Breadcrumbs 
            items={[
              { label: 'Проекты', href: '/projects' },
              { label: project.name }
            ]}
          />
        }
        hideNavbarContainer={true}
        actions={
          <div className="flex items-center gap-2">
            <ButtonDestructive 
              type="button" 
              size="default" 
              className="px-5 cursor-pointer flex-shrink-0 flex items-center gap-2"
              onClick={() => setSignOutDialogOpen(true)}
              buttonName="Project Detail - Sign Out"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </ButtonDestructive>
          </div>
        }
      />

      <BaseConfirmDialog
        title="Выход из аккаунта"
        description="Вы уверены, что хотите выйти? Для доступа к аккаунту потребуется снова войти в систему."
        submitLabel="Выйти"
        cancelLabel="Отмена"
        triggerOpen={signOutDialogOpen}
        onOpenChange={setSignOutDialogOpen}
        onSubmit={handleSignOut}
        destructive={true}
      />
      
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-8 pt-8">
        <ProjectHeader project={project} />
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <ResponsiveGrid
          columns={{ default: 1, md: 3, lg: 5 }}
          gap="lg"
          className="mb-8"
        >
          <ClickableStatCard
            icon={<TestTube2 className="w-4 h-4" />}
            label="Тест-кейсы"
            value={project._count.testCases}
            borderColor="border-l-primary/30"
            hoverColor="group-hover:bg-primary/10"
            onClick={() => router.push(`/projects/${projectId}/testcases`)}
          />
          <ClickableStatCard
            icon={<Play className="w-4 h-4" />}
            label="Тест-раны"
            value={project._count.testRuns}
            borderColor="border-l-accent/30"
            hoverColor="group-hover:bg-accent/10"
            onClick={() => router.push(`/projects/${projectId}/testruns`)}
          />
          <ClickableStatCard
            icon={<FileText className="w-4 h-4" />}
            label="Наборы тестов"
            value={project._count.testSuites}
            borderColor="border-l-purple-400/30"
            hoverColor="group-hover:bg-purple-400/10"
            onClick={() => router.push(`/projects/${projectId}/testsuites`)}
          />
          <ClickableStatCard
            icon={<Bug className="w-4 h-4" />}
            label="Дефекты"
            value={project._count?.defects || 0}
            borderColor="border-l-red-400/30"
            hoverColor="group-hover:bg-red-400/10"
            onClick={() => router.push(`/projects/${projectId}/defects`)}
          />
          <ClickableStatCard
            icon={<Folder className="w-4 h-4" />}
            label="Участники"
            value={project.members?.length || 0}
            borderColor="border-l-green-400/30"
            hoverColor="group-hover:bg-green-400/10"
            onClick={() => router.push(`/projects/${projectId}/members`)}
          />
        </ResponsiveGrid>
      </div>
    </>
  );
}
