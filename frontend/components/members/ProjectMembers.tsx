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
        label: 'メンバーを追加',
        icon: Plus,
        onClick: () => setAddDialogOpen(true),
        variant: 'primary' as const,
        buttonName: 'Project Members - Add Member',
      });
    }

    actions.push({
      type: 'signout' as const,
      showConfirmation: true,
    });

    return actions;
  }, [isAdminOrManager]);

  useEffect(() => {
    fetchProjectAndMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    if (project) {
      document.title = `メンバー - ${project.name} | EZTest`;
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
          title: 'プロジェクトが見つかりません',
          message: 'お探しのプロジェクトは存在しないか、削除されています。リダイレクト中...',
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

  const handleMemberAdded = (member: unknown) => {
    if (member) {
      const newMember = member as ProjectMember;
      setMembers([...members, newMember]);
      setAddDialogOpen(false);
      setAlert({
        type: 'success',
        title: 'メンバーを追加しました',
        message: `${newMember.user?.name || 'ユーザー'} がプロジェクトに追加されました。`,
      });
    }
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
          title: 'メンバーの削除に失敗しました',
          message: data.error || 'プロジェクトからメンバーを削除できませんでした。',
        });
        return;
      }

      setMembers(members.filter((m) => m.id !== memberToDelete.id));
      setMemberToDelete(null);
      setDeleteDialogOpen(false);
      setAlert({
        type: 'success',
        title: 'メンバーを削除しました',
        message: `${memberToDelete.name} がプロジェクトから削除されました。`,
      });
    } catch {
      setAlert({
        type: 'error',
        title: 'エラー',
        message: 'メンバーを削除する際に予期しないエラーが発生しました。',
      });
    }
  };

  if (loading) {
    return <Loader fullScreen text="メンバーを読み込み中..." />;
  }

  if (!project) {
    return (
      <NotFoundState
        title="プロジェクトが見つかりません"
        message="アクセスしようとしているプロジェクトは存在しないか、削除されています。"
        icon={Users}
        redirectingMessage="プロジェクト一覧にリダイレクトしています..."
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
              { label: 'プロジェクト', href: '/projects' },
              { label: project.name, href: `/projects/${projectId}` },
              { label: 'メンバー' },
            ]}
          />
        }
        actions={navbarActions}
      />
      
      <div className="px-8 pt-8 pb-8">
        <div className="max-w-6xl mx-auto">
          <PageHeaderWithBadge
            badge={project.key}
            title="プロジェクトメンバー"
            description={`${project.name} のメンバーを管理${!isAdminOrManager ? '（プロジェクトマネージャーと管理者がメンバーを管理できます）' : ''}`}
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
        triggerOpen={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onMemberAdded={handleMemberAdded}
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
