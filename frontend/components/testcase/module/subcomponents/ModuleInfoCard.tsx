'use client';

import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { formatDateTime } from '@/lib/date-utils';
import { Module } from '../../types';

interface ModuleInfoCardProps {
  module: Module;
  testCaseCount: number;
}

export function ModuleInfoCard({ module, testCaseCount }: ModuleInfoCardProps) {
  return (
    <DetailCard title="Information" contentClassName="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">Order</h4>
        <p className="text-white/90 text-sm">{module.order ?? 0}</p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">Test Cases</h4>
        <p className="text-white/90 text-sm">{testCaseCount}</p>
      </div>

      {module.createdAt && (
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-1">Created</h4>
          <p className="text-white/90 text-sm">
            {formatDateTime(module.createdAt)}
          </p>
        </div>
      )}

      {module.updatedAt && (
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-1">Last Updated</h4>
          <p className="text-white/90 text-sm">
            {formatDateTime(module.updatedAt)}
          </p>
        </div>
      )}
    </DetailCard>
  );
}
