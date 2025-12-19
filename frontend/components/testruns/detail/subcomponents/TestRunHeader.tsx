import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { DetailCard } from '@/components/design/DetailCard';
import { Play, Square } from 'lucide-react';

interface TestRunHeaderProps {
  testRun: {
    name: string;
    description?: string;
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    environment?: string;
    project: {
      id: string;
    };
  };
  actionLoading: boolean;
  canUpdate?: boolean;
  onStartTestRun: () => void;
  onCompleteTestRun: () => void;
}

export function TestRunHeader({
  testRun,
  actionLoading,
  canUpdate = true,
  onStartTestRun,
  onCompleteTestRun,
}: TestRunHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'IN_PROGRESS':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'COMPLETED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'CANCELLED':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <DetailCard
      title={testRun.name}
      description={testRun.description}
      contentClassName="space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-white/60">Status:</span>
            <Badge variant="outline" className={getStatusColor(testRun.status)}>
              {testRun.status.replace('_', ' ')}
            </Badge>
          </div>
          {testRun.environment && (
            <div className="flex items-center gap-2">
              <span className="text-white/60">Environment:</span>
              <Badge
                variant="outline"
                className="bg-purple-500/10 text-purple-500 border-purple-500/20"
              >
                {testRun.environment?.toUpperCase()}
              </Badge>
            </div>
          )}
        </div>

        {canUpdate && (
          <div className="flex gap-2 flex-wrap">
            {testRun.status === 'PLANNED' && (
              <ButtonPrimary
                size="default"
                onClick={onStartTestRun}
                disabled={actionLoading}
              >
                <Play className="w-4 h-4 mr-2" />
                Start Test Run
              </ButtonPrimary>
            )}
            {testRun.status === 'IN_PROGRESS' && (
              <ButtonPrimary
                size="default"
                onClick={onCompleteTestRun}
                disabled={actionLoading}
              >
                <Square className="w-4 h-4 mr-2" />
                Complete Test Run
              </ButtonPrimary>
            )}
          </div>
        )}
      </div>
    </DetailCard>
  );
}
