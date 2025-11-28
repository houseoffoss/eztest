'use client';

import { Badge } from '@/elements/badge';
import { DetailCard } from '@/components/design/DetailCard';
import { formatDateTime } from '@/lib/date-utils';
import { TestCase } from '../types';

interface TestCaseInfoCardProps {
  testCase: TestCase;
}

export function TestCaseInfoCard({ testCase }: TestCaseInfoCardProps) {
  return (
    <DetailCard title="Information" contentClassName="space-y-3">
      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">Created By</h4>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold text-white">
            {testCase.createdBy.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-white/90 text-sm">{testCase.createdBy.name}</p>
            <p className="text-white/60 text-xs">{testCase.createdBy.email}</p>
          </div>
        </div>
      </div>

      {testCase.suite && (
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-1">
            Test Suite
          </h4>
          <Badge variant="outline">{testCase.suite.name}</Badge>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">Statistics</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-white/90">
            <span>Test Runs</span>
            <span>{testCase._count.results}</span>
          </div>
          <div className="flex justify-between text-white/90">
            <span>Comments</span>
            <span>{testCase._count.comments}</span>
          </div>
          <div className="flex justify-between text-white/90">
            <span>Attachments</span>
            <span>{testCase._count.attachments}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">Created</h4>
        <p className="text-white/90 text-sm">
          {formatDateTime(testCase.createdAt)}
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">
          Last Updated
        </h4>
        <p className="text-white/90 text-sm">
          {formatDateTime(testCase.updatedAt)}
        </p>
      </div>
    </DetailCard>
  );
}
