'use client';

import { EmptyStateCard } from '@/components/design';
import { Bug } from 'lucide-react';

interface EmptyDefectStateProps {
  hasFilters: boolean;
  onCreateClick: () => void;
  canCreate?: boolean;
}

export function EmptyDefectState({ hasFilters, onCreateClick, canCreate = true }: EmptyDefectStateProps) {
  return (
    <EmptyStateCard
      icon={Bug}
      title="No defects found"
      description={hasFilters
        ? 'Try adjusting your filters'
        : 'Get started by creating your first defect'}
      actionLabel={!hasFilters && canCreate ? 'Create Defect' : undefined}
      onAction={!hasFilters && canCreate ? onCreateClick : undefined}
    />
  );
}
