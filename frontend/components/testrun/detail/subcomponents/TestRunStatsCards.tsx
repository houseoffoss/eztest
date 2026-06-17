import { formatDateTime } from '@/lib/date-utils';
import { StatCard } from '@/frontend/reusable-components/cards/StatCard';
import { ResponsiveGrid } from '@/frontend/reusable-components/layout/ResponsiveGrid';
import { CheckCircle, XCircle, Circle, Calendar, Clock, User } from 'lucide-react';
import { TestRunStats } from '../types';

interface TestRunStatsCardsProps {
  stats: TestRunStats;
  progressPercentage: number;
  passRate: number;
  testRun: {
    assignedTo?: {
      name: string;
    };
    createdAt: string;
    startedAt?: string;
  };
}

export function TestRunStatsCards({
  stats,
  progressPercentage,
  passRate,
  testRun,
}: TestRunStatsCardsProps) {
  return (
    <ResponsiveGrid
      columns={{ default: 1, md: 2, lg: 5 }}
      gap="md"
      className="mb-6"
    >
      <StatCard
        label="Прогресс"
        value={`${progressPercentage}%`}
        helpText={`${stats.total - stats.pending} из ${stats.total} выполнено`}
      />

      <StatCard
        icon={<CheckCircle className="w-5 h-5" />}
        label="Успешно"
        value={stats.passed}
        helpText={`${passRate}% успешных`}
        borderColor="border-l-green-500/30"
      />

      <StatCard
        icon={<XCircle className="w-5 h-5" />}
        label="Провалено"
        value={stats.failed}
        helpText={`${stats.blocked} заблокировано`}
        borderColor="border-l-red-500/30"
      />

      <StatCard
        icon={<Circle className="w-5 h-5" />}
        label="Not run"
        value={stats.pending}
        helpText="Еще не выполнялись"
        borderColor="border-l-gray-500/30"
      />

      <StatCard
        icon={<User className="w-5 h-5" />}
        label={testRun.assignedTo?.name || 'Не назначен'}
        value={
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Calendar className="w-3 h-3" />
              Создан {formatDateTime(testRun.createdAt)}
            </div>
            {testRun.startedAt && (
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Clock className="w-3 h-3" />
                Запущен {formatDateTime(testRun.startedAt)}
              </div>
            )}
          </div>
        }
      />
    </ResponsiveGrid>
  );
}
