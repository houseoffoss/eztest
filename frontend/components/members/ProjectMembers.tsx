'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Plus, Users } from 'lucide-react';
import { Loader } from '@/frontend/reusable-elements/loaders/Loader';
import { Navbar } from '@/frontend/reusable-components/layout/Navbar';
import { Breadcrumbs } from '@/frontend/reusable-components/layout/Breadcrumbs';
import { FloatingAlert, type FloatingAlertMessage } from '@/frontend/reusable-components/alerts/FloatingAlert';
import { PageHeaderWithBadge } from '@/frontend/reusable-components/layout/PageHeaderWithBadge';
import { NotFoundState } from '@/frontend/reusable-components/errors/NotFoundState';
import { Project, ProjectMember } from './types';
import { MembersCard } from './subcomponents/MembersCard';
import { CreateAddMemberDialog } from './subcomponents/AddMemberDialog';
import { RemoveMemberDialog } from './subcomponents/RemoveMemberDialog';
import { clearAllPersistedForms } from '@/hooks/useFormPersistence';

interface ProjectMembersProps {
  projectId: string;
}

export default function ProjectMembers({ projectId }: ProjectMembersProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<{ id: string; name: string } | null>(null);
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);

  // Check if user is admin or project manager
  const isAdminOrManager = session?.user?.roleName === 'ADMIN' || session?.user?.roleName === 'PROJECT_MANAGER';

  const navbarActions = useMemo(() => {
    const actions = [];
    
    if (isAdminOrManager) {
      actions.push({
        type: 'action' as const,
        label: 'Добавить участников',
        icon: Plus,
        onClick: () => setAddDialogOpen(true),
        variant: 'primary' as const,
        buttonName: 'Участники проекта - Добавить участников',
      });
    }

    actions.push({
      type: 'signout' as const,
      showConfirmation: true,
    });

    return actions;
  }, [isAdminOrManager]);

  const handleSignOut = () => {
    clearAllPersistedForms();
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('lastProjectId');
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith('defects-filters-')) {
          sessionStorage.removeItem(key);
        }
      });
    }
  };

  useEffect(() => {
    fetchProjectAndMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `Участники проекта - ${project.name} | EZTest`;
    }
  }, [project]);

  const fetchProjectAndMembers = async () => {
    try {
      const [projectRes, membersRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/members`),
      ]);

      if (projectRes.ok) {
        const projectData = await projectRes.json();
        setProject(projectData.data);
      } else if (projectRes.status === 404 || projectRes.status === 403) {
        // Project not found or no access - redirect after showing message
        setAlert({
          type: 'error',
          title: 'Проект не найден',
          message: 'Проект не существует или был удален. Выполняется перенаправление...',
        });
        setTimeout(() => {
          router.push('/projects');
        }, 2000);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.data || []);
      }
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const handleMembersAdded = (newMembers: unknown[]) => {
    if (!newMembers || newMembers.length === 0) {
      return;
    }

    const parsedMembers = newMembers as ProjectMember[];
    setMembers((prev) => [...prev, ...parsedMembers]);
    setAddDialogOpen(false);

    const successMessage =
      parsedMembers.length === 1
        ? `${parsedMembers[0].user?.name || 'Пользователь'} добавлен в проект.`
        : `Добавлено участников: ${parsedMembers.length}.`;

    setAlert({
      type: 'success',
      title: 'Доступ выдан',
      message: successMessage,
    });
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    setMemberToDelete({ id: memberId, name: memberName });
    setDeleteDialogOpen(true);
  };

  const confirmRemoveMember = async () => {
    if (!memberToDelete || !project) return;

    try {
      const response = await fetch(
        `/api/projects/${projectId}/members/${memberToDelete.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setAlert({
          type: 'error',
          title: 'Не удалось удалить участника',
          message: data.error || 'Не удалось удалить участника из проекта.',
        });
        return;
      }

      setMembers(members.filter((m) => m.id !== memberToDelete.id));
      setMemberToDelete(null);
      setDeleteDialogOpen(false);
      setAlert({
        type: 'success',
        title: 'Участник удален',
        message: `${memberToDelete.name} удален из проекта.`,
      });
    } catch {
      setAlert({
        type: 'error',
        title: 'Ошибка',
        message: 'Произошла непредвиденная ошибка при удалении участника.',
      });
    }
  };

  if (loading) {
    return <Loader fullScreen text="Загрузка участников проекта..." />;
  }

  if (!project) {
    return (
      <NotFoundState
        title="Проект не найден"
        message="Проект, к которому вы пытаетесь получить доступ, не существует или был удален."
        icon={Users}
        redirectingMessage="Переходим на страницу проектов..."
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
              { label: project.name, href: `/projects/${projectId}` },
              { label: 'Участники' },
            ]}
          />
        }
        actions={navbarActions}
      />
      
      <div className="px-8 pt-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <PageHeaderWithBadge
            badge={project.key}
            title="Участники проекта"
            description={`Управление доступом участников для проекта ${project.name}${!isAdminOrManager ? ' (управлять участниками могут администраторы и менеджеры проекта)' : ''}`}
            className="mb-6"
          />

          <MembersCard
            members={members}
            isAdminOrManager={isAdminOrManager}
            onRemoveMember={handleRemoveMember}
          />
        </div>
      </div>

      <CreateAddMemberDialog
        projectId={projectId}
        existingMemberUserIds={members.map((member) => member.user.id)}
        triggerOpen={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onMembersAdded={handleMembersAdded}
      />

      <RemoveMemberDialog
        member={memberToDelete}
        triggerOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmRemoveMember}
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
