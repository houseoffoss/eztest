'use client';

import { EmptyStateCard } from '@/frontend/reusable-components/cards/EmptyStateCard';
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
      title="Дефекты не найдены"
      description={hasFilters
        ? 'Попробуйте изменить фильтры'
        : 'Начните с создания первого дефекта'}
      actionLabel={!hasFilters && canCreate ? 'Создать дефект' : undefined}
      onAction={!hasFilters && canCreate ? onCreateClick : undefined}
      actionButtonName="Список дефектов - Создать дефект (пустое состояние)"
    />
  );
}
