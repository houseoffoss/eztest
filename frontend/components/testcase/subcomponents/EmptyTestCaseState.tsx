'use client';

import { EmptyState } from '@/elements/empty-state';
import { AlertCircle } from 'lucide-react';

interface EmptyTestCaseStateProps {
  hasFilters: boolean;
  onCreateClick: () => void;
}

export function EmptyTestCaseState({ hasFilters, onCreateClick }: EmptyTestCaseStateProps) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="No test cases found"
      description={hasFilters
        ? 'Try adjusting your filters'
        : 'Get started by creating your first test case'}
      actionLabel={!hasFilters ? 'Create Test Case' : undefined}
      onAction={!hasFilters ? onCreateClick : undefined}
      variant="glass"
    />
  );
}
