'use client';

import { MembersList } from '@/frontend/reusable-components/users/MembersList';
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
      title={`Участники проекта (${members.length})`}
      description="Пользователи, у которых есть доступ к этому проекту"
      emptyTitle="Участников пока нет"
      emptyDescription={isAdminOrManager ? 'Добавьте участников, чтобы начать совместную работу' : 'Ожидается добавление участников менеджером проекта или администратором'}
      onDelete={isAdminOrManager ? onRemoveMember : undefined}
      showProjects={false}
    />
  );
}
