import { Card, CardContent } from '@/elements/card';
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
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Progress</span>
            <span className="text-lg font-bold text-white">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {stats.total - stats.pending} of {stats.total} executed
          </p>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Passed</p>
              <p className="text-2xl font-bold text-green-500">{stats.passed}</p>
              <p className="text-xs text-gray-500">{passRate}% pass rate</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500/50" />
          </div>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
              <p className="text-xs text-gray-500">
                {stats.blocked} blocked, {stats.skipped} skipped
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500/50" />
          </div>
        </CardContent>
      </Card>

      <Card variant="glass">
        <CardContent className="p-4">
          <div>
            {testRun.assignedTo && (
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-white">{testRun.assignedTo.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>
                Created {new Date(testRun.createdAt).toLocaleDateString()}
              </span>
            </div>
            {testRun.startedAt && (
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <Clock className="w-3 h-3" />
                <span>
                  Started {new Date(testRun.startedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
