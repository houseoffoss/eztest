import { DetailCard } from '@/components/design/DetailCard';
import { Folder, TestTube2 } from 'lucide-react';
import { ChildSuite } from '../types';

interface ChildSuitesCardProps {
  childSuites: ChildSuite[];
  childrenCount: number;
  onChildSuiteClick: (childId: string) => void;
}

export function ChildSuitesCard({
  childSuites,
  childrenCount,
  onChildSuiteClick,
}: ChildSuitesCardProps) {
  if (!childSuites || childSuites.length === 0) {
    return null;
  }

  return (
    <DetailCard title={`Child Suites (${childrenCount})`} contentClassName="">
      <div className="space-y-2">
        {childSuites.map((child) => (
          <div
            key={child.id}
            className="flex items-center justify-between p-3 bg-white/[0.02] backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/[0.04] hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => onChildSuiteClick(child.id)}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Folder className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm text-white font-medium truncate">{child.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <TestTube2 className="w-4 h-4" />
              <span>{child._count.testCases}</span>
            </div>
          </div>
        ))}
      </div>
    </DetailCard>
  );
}
