'use client';

import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { UserInfoSection } from '@/frontend/reusable-components/data/UserInfoSection';
import { StatisticsSection } from '@/frontend/reusable-components/data/StatisticsSection';
import { DateInfoSection } from '@/frontend/reusable-components/data/DateInfoSection';
import { TestCase } from '../types';

interface TestCaseInfoCardProps {
  testCase: TestCase;
}

export function TestCaseInfoCard({ testCase }: TestCaseInfoCardProps) {
  return (
    <DetailCard title="Information" contentClassName="space-y-3">
      <UserInfoSection
        label="Created By"
        user={{
          name: testCase.createdBy.name,
          email: testCase.createdBy.email,
        }}
      />

      {testCase.suite && (
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-1">
            Test Suite
          </h4>
          <Badge variant="outline">{testCase.suite.name}</Badge>
        </div>
      )}

      <StatisticsSection
        statistics={[
          { label: 'Test Runs', value: testCase._count.results ?? 0 },
          { label: 'Comments', value: testCase._count.comments ?? 0 },
          { label: 'Attachments', value: testCase._count.attachments ?? 0 },
        ]}
      />

      <DateInfoSection label="Created" date={testCase.createdAt} />
      <DateInfoSection label="Last Updated" date={testCase.updatedAt} />
    </DetailCard>
  );
}
