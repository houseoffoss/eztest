'use client';

import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { Trash2 } from 'lucide-react';
import { Project } from '../types';

interface DangerZoneCardProps {
  project: Project;
  deleting: boolean;
  onDelete: () => void;
}

export function DangerZoneCard({ project, deleting, onDelete }: DangerZoneCardProps) {
  return (
    <DetailCard
      title="Danger Zone"
      description="Irreversible and destructive actions"
      contentClassName=""
      headerClassName="border-b border-red-400/20"
      className="border-red-400/30"
    >
        <div className="flex items-center justify-between p-4 border border-red-400/20 rounded-lg bg-red-400/5">
          <div>
            <h4 className="font-semibold text-red-300 mb-1">Delete this project</h4>
            <p className="text-sm text-red-300/70">
              Once you delete a project, there is no going back. All data will be
              permanently deleted.
            </p>
          </div>
          <ButtonDestructive
            onClick={onDelete}
            disabled={deleting}
            // className="ml-4"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Project
          </ButtonDestructive>
        </div>
    </DetailCard>
  );
}
