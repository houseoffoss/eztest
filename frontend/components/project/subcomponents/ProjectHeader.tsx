'use client';

import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { MetadataDisplay } from '@/frontend/reusable-components/data/MetadataDisplay';
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
        <p className="text-white/70 text-sm mb-2 break-words line-clamp-2">{project.description}</p>
      )}
      <MetadataDisplay
        items={[
          {
            label: 'Создал',
            value: project.createdBy.name,
          },
          {
            label: 'Последнее обновление',
            value: formatDateTime(project.updatedAt),
          },
          {
            label: 'Размер команды:',
            value: `${project.members.length} участников`,
          },
        ]}
      />
    </div>
  );
};
