'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/elements/card';
import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/elements/dropdown-menu';
import { MoreVertical, Folder, Settings, Users, Trash2, TestTube2, Play, FileText } from 'lucide-react';

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

  return (
    <Card
      variant="glass"
      className="hover:shadow-xl hover:shadow-primary/10 transition-all cursor-pointer group border-l-4 border-l-primary/30"
    >
      <CardHeader className="pb-1 pt-2.5 px-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0" onClick={() => onNavigate(`/projects/${project.id}`)}>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono text-xs px-2 py-0.5 border-primary/40 bg-primary/10 text-primary">
                {project.key}
              </Badge>
            </div>
            <CardTitle className="text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1 text-white">
              {project.name}
            </CardTitle>
            {project.description && (
              <CardDescription className="line-clamp-1 text-sm text-white/60">
                {project.description}
              </CardDescription>
            )}
          </div>
          {hasActionPermissions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 -mt-1 shrink-0 hover:bg-white/10">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onNavigate(`/projects/${project.id}`)} className="hover:bg-white/10">
                  <Folder className="w-4 h-4 mr-2" />
                  Open Project
                </DropdownMenuItem>
                {canUpdate && (
                  <DropdownMenuItem onClick={() => onNavigate(`/projects/${project.id}/settings`)} className="hover:bg-white/10">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                )}
                {canManageMembers && (
                  <DropdownMenuItem onClick={() => onNavigate(`/projects/${project.id}/members`)} className="hover:bg-white/10">
                    <Users className="w-4 h-4 mr-2" />
                    Manage Members
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem onClick={onDelete} className="text-red-400 hover:bg-red-400/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent onClick={() => onNavigate(`/projects/${project.id}`)} className="py-2.5 px-3.5">
        <div className="grid grid-cols-3 gap-2.5 mb-2.5">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TestTube2 className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-white">
              {project._count?.testCases || 0}
            </div>
            <div className="text-xs text-white/60">Test Cases</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Play className="w-4 h-4 text-accent" />
            </div>
            <div className="text-2xl font-bold text-white">
              {project._count?.testRuns || 0}
            </div>
            <div className="text-xs text-white/60">Test Runs</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <FileText className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {project._count?.testSuites || 0}
            </div>
            <div className="text-xs text-white/60">Test Suites</div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {project.members.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold border-2 border-background"
                  title={member.user.name}
                >
                  {member.user.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {project.members.length > 3 && (
                <div className="w-7 h-7 rounded-full bg-white/10 text-white/70 flex items-center justify-center text-xs font-semibold border-2 border-background">
                  +{project.members.length - 3}
                </div>
              )}
            </div>
            <span className="text-xs text-white/60">
              {project.members.length} member{project.members.length !== 1 ? 's' : ''}
            </span>
          </div>
          <span className="text-xs text-white/50">
            Updated {new Date(project.updatedAt).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
