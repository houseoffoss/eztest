'use client';

import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { DetailCard } from '@/components/design/DetailCard';
import { UserCard } from '@/components/design/UserCard';
import { Trash2, Shield, Eye, Users } from 'lucide-react';
import { ProjectMember } from '../types';

interface MembersCardProps {
  members: ProjectMember[];
  isAdminOrManager: boolean;
  onRemoveMember: (memberId: string, memberName: string) => void;
}

export function MembersCard({ members, isAdminOrManager, onRemoveMember }: MembersCardProps) {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="w-3 h-3" />;
      case 'VIEWER':
        return <Eye className="w-3 h-3" />;
      default:
        return <Users className="w-3 h-3" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-8 pb-8">
      <DetailCard
        title={`Project Members (${members.length})`}
        description="People who have access to this project"
        contentClassName=""
      >
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">No members yet</h3>
              <p className="text-white/60 mb-6">
                {isAdminOrManager ? 'Add project members to collaborate on this project' : 'Waiting for project manager or admin to add members'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <UserCard
                  key={member.id}
                  user={{
                    id: member.user.id,
                    name: member.user.name,
                    email: member.user.email,
                    avatar: member.user.avatar,
                    role: member.user.role,
                    createdAt: member.joinedAt,
                  }}
                  onDelete={isAdminOrManager ? () => onRemoveMember(member.id, member.user.name) : undefined}
                  showProjects={false}
                  getRoleBadgeColor={(roleName) => {
                    switch (roleName) {
                      case 'ADMIN':
                        return 'bg-red-500/10 text-red-500 border-red-500/20';
                      case 'PROJECT_MANAGER':
                        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
                      case 'TESTER':
                        return 'bg-green-500/10 text-green-500 border-green-500/20';
                      case 'VIEWER':
                        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
                      default:
                        return 'bg-white/10 text-white border-white/20';
                    }
                  }}
                  getRoleIcon={(roleName) => {
                    switch (roleName) {
                      case 'ADMIN':
                      case 'PROJECT_MANAGER':
                        return <Shield className="w-3 h-3" />;
                      case 'VIEWER':
                        return <Eye className="w-3 h-3" />;
                      default:
                        return <Users className="w-3 h-3" />;
                    }
                  }}
                />
              ))}
            </div>
          )}
      </DetailCard>
    </div>
  );
}
