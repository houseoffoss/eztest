'use client';

import { EmptyState } from '@/elements/empty-state';
import { AlertCircle } from 'lucide-react';

interface EmptyTestCaseStateProps {
  hasFilters: boolean;
  onCreateClick: () => void;
  canCreate?: boolean;
}

export function EmptyTestCaseState({ hasFilters, onCreateClick, canCreate = true }: EmptyTestCaseStateProps) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="No test cases found"
      description={hasFilters
        ? 'Try adjusting your filters'
        : 'Get started by creating your first test case'}
      actionLabel={!hasFilters && canCreate ? 'Create Test Case' : undefined}
      onAction={!hasFilters && canCreate ? onCreateClick : undefined}
      variant="glass"
    />
  );
}
