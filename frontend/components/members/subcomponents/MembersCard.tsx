'use client';

import { MembersList } from '@/frontend/reusable-components/users/MembersList';
import { Users } from 'lucide-react';
import { ProjectMember } from '../types';

interface MembersCardProps {
  members: ProjectMember[];
  isAdminOrManager: boolean;
  onRemoveMember: (memberId: string, memberName: string) => void;
}

export function MembersCard({ members, isAdminOrManager, onRemoveMember }: MembersCardProps) {
  return (
    <MembersList
      members={members.map((member) => ({
        id: member.id,
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          avatar: member.user.avatar,
          role: member.user.role,
        },
        createdAt: member.joinedAt,
      }))}
      title={`プロジェクトメンバー（${members.length}）`}
      description="このプロジェクトにアクセスできるメンバー"
      emptyTitle="メンバーがいません"
      emptyDescription={isAdminOrManager ? 'プロジェクトメンバーを追加して協力できます' : 'プロジェクトマネージャーまたは管理者によるメンバー追加をお待ちください'}
      emptyIcon={Users}
      onDelete={isAdminOrManager ? onRemoveMember : undefined}
      showProjects={false}
    />
  );
}
