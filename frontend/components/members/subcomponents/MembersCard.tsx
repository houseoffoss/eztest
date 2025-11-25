'use client';

import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { DetailCard } from '@/components/design/DetailCard';
import { formatDate } from '@/lib/date-utils';
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
        title={`Team Members (${members.length})`}
        description="People who have access to this project"
        contentClassName=""
      >
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">No members yet</h3>
              <p className="text-white/60 mb-6">
                {isAdminOrManager ? 'Add team members to collaborate on this project' : 'Waiting for project manager or admin to add members'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <h4 className="font-semibold text-white whitespace-nowrap">{member.user.name}</h4>
                      <Badge
                        variant={getRoleBadgeVariant(member.role)}
                        className="gap-1 border-primary/40 bg-primary/10 text-primary text-xs py-0.5 flex-shrink-0"
                      >
                        {getRoleIcon(member.role)}
                        {member.role}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="text-xs border-accent/40 bg-accent/10 text-accent py-0.5 flex-shrink-0"
                      >
                        {member.user.role.name}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                    <div className="text-right whitespace-nowrap text-sm">
                      <span className="text-white/70">{member.user.email}</span>
                      <span className="text-white/50 mx-2">•</span>
                      <span className="text-white/50">
                        Joined {formatDate(member.joinedAt)}
                      </span>
                    </div>
                    {isAdminOrManager && (
                      <Button
                        variant="glass"
                        size="icon"
                        onClick={() => onRemoveMember(member.id, member.user.name)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </DetailCard>
    </div>
  );
}
