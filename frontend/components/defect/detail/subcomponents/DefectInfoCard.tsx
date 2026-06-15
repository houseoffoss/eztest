'use client';

import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { UserInfoSection } from '@/frontend/reusable-components/data/UserInfoSection';
import { StatisticsSection } from '@/frontend/reusable-components/data/StatisticsSection';
import { DateInfoSection } from '@/frontend/reusable-components/data/DateInfoSection';
import { Defect } from '../types';

interface DefectInfoCardProps {
  defect: Defect;
}

export function DefectInfoCard({ defect }: DefectInfoCardProps) {
  return (
    <DetailCard title="Информация" contentClassName="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">ID дефекта</h4>
        <p className="text-white/90 text-sm font-mono">{defect.defectId}</p>
      </div>

      <UserInfoSection
        label="Создан"
        user={{
          name: defect.createdBy.name,
          email: defect.createdBy.email,
        }}
      />

      {defect.assignedTo && (
        <UserInfoSection
          label="Назначен"
          user={{
            name: defect.assignedTo.name,
            email: defect.assignedTo.email,
          }}
          avatarGradient="from-green-500 to-teal-500"
        />
      )}

      {defect.testCases && defect.testCases.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-1">
            Связанные тест-кейсы
          </h4>
          <div className="space-y-2">
            {defect.testCases.map((tc) => (
              <div key={tc.id}>
                <Badge variant="outline" className="font-mono">
                  {tc.testCase.tcId}
                </Badge>
                <p className="text-white/70 text-xs mt-1">{tc.testCase.title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {defect.testRun && (
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-1">
            Тест-ран
          </h4>
          <Badge variant="outline">{defect.testRun.name}</Badge>
        </div>
      )}

      <StatisticsSection
        statistics={[
          { label: 'Комментарии', value: defect.comments.length },
          { label: 'Вложения', value: defect.attachments.length },
        ]}
      />

      <DateInfoSection label="Создан" date={defect.createdAt} />
      <DateInfoSection label="Обновлен" date={defect.updatedAt} />
      {defect.resolvedAt && (
        <DateInfoSection label="Решен" date={defect.resolvedAt} />
      )}
      {defect.closedAt && (
        <DateInfoSection label="Закрыт" date={defect.closedAt} />
      )}
    </DetailCard>
  );
}
