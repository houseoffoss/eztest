import { formatDateTime } from '@/lib/date-utils';
import { StatCard } from '@/components/design/StatCard';
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Progress"
        value={`${progressPercentage}%`}
        helpText={`${stats.total - stats.pending} of ${stats.total} executed`}
      />

      <StatCard
        icon={<CheckCircle className="w-5 h-5" />}
        label="Passed"
        value={stats.passed}
        helpText={`${passRate}% pass rate`}
        borderColor="border-l-green-500/30"
      />

      <StatCard
        icon={<XCircle className="w-5 h-5" />}
        label="Failed"
        value={stats.failed}
        helpText={`${stats.blocked} blocked, ${stats.skipped} skipped`}
        borderColor="border-l-red-500/30"
      />

      <StatCard
        icon={<User className="w-5 h-5" />}
        label={testRun.assignedTo?.name || 'Unassigned'}
        value={
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/60">
              <Calendar className="w-3 h-3" />
              Created {formatDateTime(testRun.createdAt)}
            </div>
            {testRun.startedAt && (
              <div className="flex items-center gap-2 text-xs text-white/60">
                <Clock className="w-3 h-3" />
                Started {formatDateTime(testRun.startedAt)}
              </div>
            )}
          </div>
        }
      />
    </div>
  );
}
