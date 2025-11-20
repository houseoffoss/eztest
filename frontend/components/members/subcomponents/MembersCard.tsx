'use client';

import { Button } from '@/elements/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/elements/card';
import { Badge } from '@/elements/badge';
import { Plus, Trash2, Mail, Shield, Eye, Users } from 'lucide-react';
import { ProjectMember } from '../types';

interface MembersCardProps {
  members: ProjectMember[];
  isAdminOrManager: boolean;
  onAddMember: () => void;
  onRemoveMember: (memberId: string, memberName: string) => void;
}

export function MembersCard({ members, isAdminOrManager, onAddMember, onRemoveMember }: MembersCardProps) {
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
      <Card variant="glass">
        <CardHeader>
          <CardTitle className="text-white">Team Members ({members.length})</CardTitle>
          <CardDescription className="text-white/70">
            People who have access to this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-white/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">No members yet</h3>
              <p className="text-white/60 mb-6">
                {isAdminOrManager ? 'Add team members to collaborate on this project' : 'Waiting for project manager or admin to add members'}
              </p>
              {isAdminOrManager && (
                <Button onClick={onAddMember} variant="glass-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Member
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-semibold">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white">{member.user.name}</h4>
                        <Badge
                          variant={getRoleBadgeVariant(member.role)}
                          className="gap-1 border-primary/40 bg-primary/10 text-primary"
                        >
                          {getRoleIcon(member.role)}
                          {member.role}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="text-xs border-accent/40 bg-accent/10 text-accent"
                        >
                          {member.user.role.name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white/60">
                        <Mail className="w-3 h-3" />
                        {member.user.email}
                      </div>
                      <p className="text-xs text-white/50 mt-1">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {isAdminOrManager && (
                    <Button
                      variant="glass"
                      size="icon"
                      onClick={() => onRemoveMember(member.id, member.user.name)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
