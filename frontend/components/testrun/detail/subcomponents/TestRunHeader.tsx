'use client';

import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { ActionButtonGroup } from '@/frontend/reusable-components/layout/ActionButtonGroup';
import { Play, Square, Pencil, X, Check } from 'lucide-react';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { getDynamicBadgeProps } from '@/lib/badge-color-utils';
import { useState } from 'react';
import { Input } from '@/frontend/reusable-elements/inputs/Input';

interface TestRunHeaderProps {
  testRun: {
    name: string;
    description?: string;
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    environment?: string;
    project: {
      id: string;
    };
  };
  executionTypeLabel?: string;
  actionLoading: boolean;
  canUpdate?: boolean;
  onStartTestRun: () => void;
  onCompleteTestRun: () => void;
  onNameUpdate?: (name: string) => Promise<void>;
}

export function TestRunHeader({
  testRun,
  executionTypeLabel,
  actionLoading,
  canUpdate = true,
  onStartTestRun,
  onCompleteTestRun,
  onNameUpdate,
}: TestRunHeaderProps) {
  const { options: statusOptions } = useDropdownOptions('TestRun', 'status');
  const { options: environmentOptions } = useDropdownOptions('TestRun', 'environment');
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [savingName, setSavingName] = useState(false);

  const handleEditClick = () => {
    setNameValue(testRun.name);
    setEditingName(true);
  };

  const handleNameSave = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed || trimmed === testRun.name || !onNameUpdate) {
      setEditingName(false);
      return;
    }
    setSavingName(true);
    try {
      await onNameUpdate(trimmed);
    } finally {
      setSavingName(false);
      setEditingName(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleNameSave();
    if (e.key === 'Escape') setEditingName(false);
  };

  const statusBadgeProps = getDynamicBadgeProps(testRun.status, statusOptions);
  const environmentBadgeProps = testRun.environment
    ? getDynamicBadgeProps(testRun.environment, environmentOptions)
    : null;

  // Get labels from dropdown options
  const statusLabel = statusOptions.find(opt => opt.value === testRun.status)?.label || testRun.status.replace('_', ' ');
  const environmentLabel = testRun.environment
    ? (environmentOptions.find(opt => opt.value === testRun.environment)?.label || testRun.environment.toUpperCase())
    : null;

  // Determine execution type badge color based on label
  const executionTypeBadgeClassName = executionTypeLabel === 'Automation'
    ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    : 'bg-blue-500/10 text-blue-500 border-blue-500/20';

  const titleContent = editingName ? (
    <div className="flex items-center gap-2">
      <Input
        variant="glass"
        value={nameValue}
        onChange={(e) => setNameValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        maxLength={255}
        className="text-lg font-semibold"
        disabled={savingName}
      />
      <button
        onClick={handleNameSave}
        disabled={savingName}
        className="p-1.5 rounded text-green-400 hover:text-green-300 hover:bg-white/10 transition-colors disabled:opacity-50"
      >
        <Check className="w-4 h-4" />
      </button>
      <button
        onClick={() => setEditingName(false)}
        disabled={savingName}
        className="p-1.5 rounded text-white/60 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2 group">
      <span>{testRun.name}</span>
      {canUpdate && onNameUpdate && (
        <button
          onClick={handleEditClick}
          className="p-1 rounded opacity-0 group-hover:opacity-100 text-white/40 hover:text-white/90 hover:bg-white/10 transition-all"
          title="Редактировать название"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <DetailCard
      title={titleContent}
      description={testRun.description}
      contentClassName="space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-white/60">Статус:</span>
            <Badge
              variant="outline"
              className={statusBadgeProps.className}
              style={statusBadgeProps.style}
            >
              {statusLabel}
            </Badge>
          </div>
          {executionTypeLabel && (
            <div className="flex items-center gap-2">
              <span className="text-white/60">Тип запуска:</span>
              <Badge variant="outline" className={executionTypeBadgeClassName}>
                {executionTypeLabel}
              </Badge>
            </div>
          )}
          {testRun.environment && environmentBadgeProps && (
            <div className="flex items-center gap-2">
              <span className="text-white/60">Окружение:</span>
              <Badge
                variant="outline"
                className={environmentBadgeProps.className}
                style={environmentBadgeProps.style}
              >
                {environmentLabel}
              </Badge>
            </div>
          )}
        </div>

        {canUpdate && (
          <ActionButtonGroup
            buttons={[
              {
                label: 'Запустить тест-ран',
                icon: Play,
                onClick: onStartTestRun,
                variant: 'primary',
                show: testRun.status === 'PLANNED',
                loading: actionLoading && testRun.status === 'PLANNED',
              },
              {
                label: 'Завершить тест-ран',
                icon: Square,
                onClick: onCompleteTestRun,
                variant: 'primary',
                show: testRun.status === 'IN_PROGRESS',
                loading: actionLoading && testRun.status === 'IN_PROGRESS',
              },
            ]}
          />
        )}
      </div>
    </DetailCard>
  );
}
