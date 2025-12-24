'use client';

import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { TestCase } from '../../types';

interface ModuleStatisticsCardProps {
  testCases: TestCase[];
}

export function ModuleStatisticsCard({ testCases }: ModuleStatisticsCardProps) {
  const activeCount = testCases.filter(tc => tc.status === 'ACTIVE').length;
  const draftCount = testCases.filter(tc => tc.status === 'DRAFT').length;
  const deprecatedCount = testCases.filter(tc => tc.status === 'DEPRECATED').length;
  const totalRuns = testCases.reduce((sum, tc) => sum + (tc._count?.results || 0), 0);

  return (
    <DetailCard title="Statistics" contentClassName="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">Status Breakdown</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-white/90">
            <span>Active</span>
            <span className="font-medium text-green-400">{activeCount}</span>
          </div>
          <div className="flex justify-between text-white/90">
            <span>Draft</span>
            <span className="font-medium text-yellow-400">{draftCount}</span>
          </div>
          <div className="flex justify-between text-white/90">
            <span>Deprecated</span>
            <span className="font-medium text-red-400">{deprecatedCount}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 pt-3">
        <h4 className="text-sm font-medium text-white/60 mb-1">Total Runs</h4>
        <p className="text-white/90 text-lg font-semibold">{totalRuns}</p>
      </div>
    </DetailCard>
  );
}
