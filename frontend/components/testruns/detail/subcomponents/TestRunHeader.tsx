import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
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
  onStartTestRun: () => void;
  onCompleteTestRun: () => void;
}

export function TestRunHeader({
  testRun,
  actionLoading,
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
    <div className="mb-6">

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{testRun.name}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getStatusColor(testRun.status)}>
              {testRun.status.replace('_', ' ')}
            </Badge>
            {testRun.environment && (
              <Badge
                variant="outline"
                className="bg-purple-500/10 text-purple-500 border-purple-500/20"
              >
                {testRun.environment}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          {testRun.status === 'PLANNED' && (
            <Button
              variant="glass-primary"
              onClick={onStartTestRun}
              disabled={actionLoading}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Test Run
            </Button>
          )}
          {testRun.status === 'IN_PROGRESS' && (
            <Button
              variant="glass-primary"
              onClick={onCompleteTestRun}
              disabled={actionLoading}
            >
              <Square className="w-4 h-4 mr-2" />
              Complete Test Run
            </Button>
          )}
        </div>
      </div>

      {testRun.description && (
        <p className="text-gray-400">{testRun.description}</p>
      )}
    </div>
  );
}
