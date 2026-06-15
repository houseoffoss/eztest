'use client';

import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { StatisticsSection } from '@/frontend/reusable-components/data/StatisticsSection';
import { DateInfoSection } from '@/frontend/reusable-components/data/DateInfoSection';
import { Module } from '../../types';

interface ModuleInfoCardProps {
  module: Module;
  testCaseCount: number;
}

export function ModuleInfoCard({ module, testCaseCount }: ModuleInfoCardProps) {
  return (
    <DetailCard title="Информация" contentClassName="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">Порядок</h4>
        <p className="text-white/90 text-sm">{module.order ?? 0}</p>
      </div>

      <StatisticsSection
        statistics={[
          { label: 'Тест-кейсы', value: testCaseCount },
        ]}
      />

      {module.createdAt && (
        <DateInfoSection label="Создан" date={module.createdAt} />
      )}

      {module.updatedAt && (
        <DateInfoSection label="Последнее обновление" date={module.updatedAt} />
      )}
    </DetailCard>
  );
}
