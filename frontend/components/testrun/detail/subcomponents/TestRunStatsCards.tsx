import { formatDateTime } from '@/lib/date-utils';
import { StatCard } from '@/frontend/reusable-components/cards/StatCard';
import { ResponsiveGrid } from '@/frontend/reusable-components/layout/ResponsiveGrid';
import { CheckCircle, XCircle, Calendar, Clock, User } from 'lucide-react';
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
      columns={{ default: 1, md: 2, lg: 4 }}
      gap="md"
      className="mb-6"
    >
      <StatCard
        label="進捗"
        value={`${progressPercentage}%`}
        helpText={`${stats.total} 件中 ${stats.total - stats.pending} 件実行済み`}
      />

      <StatCard
        icon={<CheckCircle className="w-5 h-5" />}
        label="合格"
        value={stats.passed}
        helpText={`合格率 ${passRate}%`}
        borderColor="border-l-green-500/30"
      />

      <StatCard
        icon={<XCircle className="w-5 h-5" />}
        label="不合格"
        value={stats.failed}
        helpText={`ブロック ${stats.blocked}、スキップ ${stats.skipped}`}
        borderColor="border-l-red-500/30"
      />

      <StatCard
        icon={<User className="w-5 h-5" />}
        label={testRun.assignedTo?.name || '未割当'}
        value={
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Calendar className="w-3 h-3" />
              作成日時 {formatDateTime(testRun.createdAt)}
            </div>
            {testRun.startedAt && (
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Clock className="w-3 h-3" />
                開始日時 {formatDateTime(testRun.startedAt)}
              </div>
            )}
          </div>
        }
      />
    </ResponsiveGrid>
  );
}
