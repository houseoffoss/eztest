import { Card, CardContent, CardHeader, CardTitle } from '@/elements/card';
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
    <Card variant="glass">
      <CardHeader>
        <CardTitle>Child Suites ({childrenCount})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {childSuites.map((child) => (
            <div
              key={child.id}
              className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => onChildSuiteClick(child.id)}
            >
              <div className="flex items-center gap-3">
                <Folder className="w-5 h-5 text-primary" />
                <span className="text-white/90 font-medium">{child.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <TestTube2 className="w-4 h-4" />
                <span>{child._count.testCases}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
