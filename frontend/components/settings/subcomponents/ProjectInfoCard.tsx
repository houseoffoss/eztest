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
      title="プロジェクト情報"
      description="読み取り専用のプロジェクト詳細"
      contentClassName="space-y-3"
    >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white/60 text-xs">作成日時</Label>
            <p className="text-sm font-medium text-white">
              {formatDateTime(project.createdAt)}
            </p>
          </div>
          <div>
            <Label className="text-white/60 text-xs">最終更新</Label>
            <p className="text-sm font-medium text-white">
              {formatDateTime(project.updatedAt)}
            </p>
          </div>
          <div>
            <Label className="text-white/60 text-xs">プロジェクトID</Label>
            <p className="text-sm font-mono text-white/80">{project.id}</p>
          </div>
        </div>
    </DetailCard>
  );
}
