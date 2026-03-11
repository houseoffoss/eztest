'use client';

import { EmptyStateCard } from '@/frontend/reusable-components/cards/EmptyStateCard';
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
      title="テストランがありません"
      description={hasTestRuns
        ? 'フィルターを調整してみてください'
        : '最初のテストランを作成して始めましょう'}
      actionLabel={!hasTestRuns && canCreate ? 'テストランを作成' : undefined}
      onAction={!hasTestRuns && canCreate ? onCreateClick : undefined}
    />
  );
}
