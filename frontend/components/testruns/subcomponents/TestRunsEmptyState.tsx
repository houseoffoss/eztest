'use client';

import { EmptyStateCard } from '@/components/design';
import { AlertCircle } from 'lucide-react';

interface TestRunsEmptyStateProps {
  hasTestRuns: boolean;
  onCreateClick: () => void;
  canCreate?: boolean;
}

export function TestRunsEmptyState({
  hasTestRuns,
  onCreateClick,
  canCreate = true,
}: TestRunsEmptyStateProps) {
  return (
    <EmptyStateCard
      icon={AlertCircle}
      title="No test runs found"
      description={hasTestRuns
        ? 'Try adjusting your filters'
        : 'Get started by creating your first test run'}
      actionLabel={!hasTestRuns && canCreate ? 'Create Test Run' : undefined}
      onAction={!hasTestRuns && canCreate ? onCreateClick : undefined}
    />
  );
}
