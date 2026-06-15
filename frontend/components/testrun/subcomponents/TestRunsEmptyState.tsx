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
      title="Тест-раны не найдены"
      description={hasTestRuns
        ? 'Попробуйте изменить фильтры'
        : 'Начните с создания первого тест-рана'}
      actionLabel={!hasTestRuns && canCreate ? 'Создать тест-ран' : undefined}
      onAction={!hasTestRuns && canCreate ? onCreateClick : undefined}
    />
  );
}
