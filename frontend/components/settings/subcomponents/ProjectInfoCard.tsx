'use client';

import { formatDateTime } from '@/lib/date-utils';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Project } from '../types';

interface ProjectInfoCardProps {
  project: Project;
}

export function ProjectInfoCard({ project }: ProjectInfoCardProps) {
  return (
    <DetailCard
      title="Project Information"
      description="Read-only project details"
      contentClassName="space-y-3"
    >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white/60 text-xs">Created At</Label>
            <p className="text-sm font-medium text-white">
              {formatDateTime(project.createdAt)}
            </p>
          </div>
          <div>
            <Label className="text-white/60 text-xs">Last Updated</Label>
            <p className="text-sm font-medium text-white">
              {formatDateTime(project.updatedAt)}
            </p>
          </div>
          <div>
            <Label className="text-white/60 text-xs">Project ID</Label>
            <p className="text-sm font-mono text-white/80">{project.id}</p>
          </div>
        </div>
    </DetailCard>
  );
}
