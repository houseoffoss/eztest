import { formatDateTime } from '@/lib/date-utils';
import { DetailCard } from '@/components/design/DetailCard';
import { Button } from '@/elements/button';
import { Folder } from 'lucide-react';

interface TestSuiteInfoCardProps {
  parent?: {
    id: string;
    name: string;
  };
  testCasesCount: number;
  childrenCount: number;
  createdAt: string;
  updatedAt: string;
  onParentClick: (parentId: string) => void;
}

export function TestSuiteInfoCard({
  parent,
  testCasesCount,
  childrenCount,
  createdAt,
  updatedAt,
  onParentClick,
}: TestSuiteInfoCardProps) {
  return (
    <DetailCard title="Information" contentClassName="space-y-3">
      {parent && (
        <div>
          <h4 className="text-sm font-medium text-white/60 mb-1">
            Parent Suite
          </h4>
          <Button
            variant="glass"
            size="sm"
            className="w-full justify-start"
            onClick={() => onParentClick(parent.id)}
          >
            <Folder className="w-4 h-4 mr-2" />
            {parent.name}
          </Button>
        </div>
      )}

      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">
          Statistics
        </h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-white/90">
            <span>Test Cases</span>
            <span>{testCasesCount}</span>
          </div>
          <div className="flex justify-between text-white/90">
            <span>Child Suites</span>
            <span>{childrenCount}</span>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">
          Created
        </h4>
        <p className="text-white/90 text-sm">
          {formatDateTime(createdAt)}
        </p>
      </div>

      <div>
        <h4 className="text-sm font-medium text-white/60 mb-1">
          Last Updated
        </h4>
        <p className="text-white/90 text-sm">
          {formatDateTime(updatedAt)}
        </p>
      </div>
    </DetailCard>
  );
}
