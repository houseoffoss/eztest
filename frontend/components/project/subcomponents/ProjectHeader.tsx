'use client';

import { Badge } from '@/elements/badge';
import { formatDateTime } from '@/lib/date-utils';

interface ProjectHeaderProps {
  project: {
    key: string;
    name: string;
    description: string | null;
    createdBy: {
      name: string;
    };
    updatedAt: string;
    members: Array<{
      id: string;
    }>;
  };
}

export const ProjectHeader = ({ project }: ProjectHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <Badge variant="outline" className="font-mono border-primary/40 bg-primary/10 text-primary text-xs px-2.5 py-0.5">
          {project.key}
        </Badge>
        <h1 className="text-2xl font-bold text-white">{project.name}</h1>
      </div>
      {project.description && (
        <p className="text-white/70 text-sm mb-2">{project.description}</p>
      )}
      <div className="flex items-center gap-4 text-xs text-white/60">
        <div>
          Created by <span className="font-semibold text-white/90">{project.createdBy.name}</span>
        </div>
        <div>•</div>
        <div>
          Last updated {formatDateTime(project.updatedAt)}
        </div>
        <div>•</div>
        <div>
          Team Size: <span className="font-semibold text-white/90">{project.members.length} members</span>
        </div>
      </div>
    </div>
  );
};
