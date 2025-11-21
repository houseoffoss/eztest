import { EmptyState } from '@/elements/empty-state';
import { AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/elements/button';

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
    <EmptyState
      icon={AlertCircle}
      title="No test runs found"
      description={hasTestRuns
        ? 'Try adjusting your filters'
        : 'Get started by creating your first test run'}
      actionLabel={!hasTestRuns && canCreate ? 'Create Test Run' : undefined}
      onAction={!hasTestRuns && canCreate ? onCreateClick : undefined}
      variant="glass"
    />
  );
}
