import { EmptyState } from '@/elements/empty-state';
import { AlertCircle, Plus } from 'lucide-react';
import { Button } from '@/elements/button';

interface TestRunsEmptyStateProps {
  hasTestRuns: boolean;
  onCreateClick: () => void;
}

export function TestRunsEmptyState({
  hasTestRuns,
  onCreateClick,
}: TestRunsEmptyStateProps) {
  return (
    <EmptyState
      icon={AlertCircle}
      title="No test runs found"
      description={hasTestRuns
        ? 'Try adjusting your filters'
        : 'Get started by creating your first test run'}
      actionLabel={!hasTestRuns ? 'Create Test Run' : undefined}
      onAction={!hasTestRuns ? onCreateClick : undefined}
      variant="glass"
    />
  );
}
