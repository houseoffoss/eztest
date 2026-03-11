'use client';

import { formatDateTime } from '@/lib/date-utils';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { ItemCard } from '@/frontend/reusable-components/cards/ItemCard';
import { ActionMenu } from '@/frontend/reusable-components/menus/ActionMenu';
import { StatsGrid } from '@/frontend/reusable-components/data/StatsGrid';
import { AvatarStack } from '@/frontend/reusable-components/users/AvatarStack';
import { Folder, Settings, Users, Trash2, TestTube2, Play, FileText, Bug } from 'lucide-react';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    key: string;
    description: string | null;
    updatedAt: string;
    members: Array<{
      id: string;
      user: {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
      };
    }>;
    _count?: {
      testCases: number;
      testRuns: number;
      testSuites: number;
      defects?: number;
    };
  };
  onNavigate: (path: string) => void;
  onDelete: () => void;
  canUpdate?: boolean;
  canDelete?: boolean;
  canManageMembers?: boolean;
}

export const ProjectCard = ({ project, onNavigate, onDelete, canUpdate = false, canDelete = false, canManageMembers = false }: ProjectCardProps) => {
  // If user can't perform any actions, show simplified card
  const hasActionPermissions = canUpdate || canDelete || canManageMembers;

  const badges = (
    <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 border-primary/40 bg-primary/10 text-primary">
      {project.key}
    </Badge>
  );

  const header = hasActionPermissions && (
    <ActionMenu
      items={[
        {
          label: 'プロジェクトを開く',
          icon: Folder,
          onClick: () => onNavigate(`/projects/${project.id}`),
        },
        {
          label: '設定',
          icon: Settings,
          onClick: () => onNavigate(`/projects/${project.id}/settings`),
          show: canUpdate,
        },
        {
          label: 'メンバー管理',
          icon: Users,
          onClick: () => onNavigate(`/projects/${project.id}/members`),
          show: canManageMembers,
        },
        {
          label: '削除',
          icon: Trash2,
          onClick: onDelete,
          variant: 'destructive',
          show: canDelete,
          buttonName: `Project Card - Delete (${project.name})`,
        },
      ]}
    />
  );

  const content = (
    <StatsGrid
      stats={[
        {
          icon: TestTube2,
          value: project._count?.testCases || 0,
          label: 'テストケース',
          iconColor: 'text-primary',
        },
        {
          icon: Play,
          value: project._count?.testRuns || 0,
          label: 'テストラン',
          iconColor: 'text-accent',
        },
        {
          icon: FileText,
          value: project._count?.testSuites || 0,
          label: 'テストスイート',
          iconColor: 'text-purple-400',
        },
        {
          icon: Bug,
          value: project._count?.defects || 0,
          label: 'Defect',
          iconColor: 'text-red-400',
        },
      ]}
      columns={4}
      gap="sm"
      className="mb-2.5"
    />
  );

  const footer = (
    <>
      <div className="flex items-center gap-2">
        <AvatarStack
          avatars={project.members.map((member) => ({
            id: member.id,
            name: member.user.name,
            avatar: member.user.avatar,
            email: member.user.email,
          }))}
          maxVisible={3}
          size="md"
          showCount={true}
        />
        <span className="text-xs text-white/60">
          {project.members.length} 名のメンバー
        </span>
      </div>
      <span className="text-xs text-white/50">
        Updated {formatDateTime(project.updatedAt)}
      </span>
    </>
  );

  return (
    <ItemCard
      title={project.name}
      description={project.description || undefined}
      descriptionClassName="line-clamp-2 break-words text-sm text-white/60 min-h-5"
      badges={badges}
      header={header}
      content={content}
      footer={footer}
      onClick={() => onNavigate(`/projects/${project.id}`)}
      borderColor="primary"
    />
  );
};
