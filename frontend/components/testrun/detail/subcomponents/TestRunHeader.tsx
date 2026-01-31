import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { ActionButtonGroup } from '@/frontend/reusable-components/layout/ActionButtonGroup';
import { Play, Square } from 'lucide-react';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { getDynamicBadgeProps } from '@/lib/badge-color-utils';

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
  const { options: statusOptions } = useDropdownOptions('TestRun', 'status');
  const { options: environmentOptions } = useDropdownOptions('TestRun', 'environment');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const statusBadgeProps = getDynamicBadgeProps(testRun.status, statusOptions);
  const environmentBadgeProps = testRun.environment 
    ? getDynamicBadgeProps(testRun.environment, environmentOptions)
    : null;

  // Get labels from dropdown options
  const statusLabel = statusOptions.find(opt => opt.value === testRun.status)?.label || testRun.status.replace('_', ' ');
  const environmentLabel = testRun.environment 
    ? (environmentOptions.find(opt => opt.value === testRun.environment)?.label || testRun.environment.toUpperCase())
    : null;

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
            <Badge 
              variant="outline" 
              className={statusBadgeProps.className}
              style={statusBadgeProps.style}
            >
              {statusLabel}
            </Badge>
          </div>
          {testRun.environment && environmentBadgeProps && (
            <div className="flex items-center gap-2">
              <span className="text-white/60">Environment:</span>
              <Badge
                variant="outline"
                className={environmentBadgeProps.className}
                style={environmentBadgeProps.style}
              >
                {environmentLabel}
              </Badge>
            </div>
          )}
        </div>

        {canUpdate && (
          <ActionButtonGroup
            buttons={[
              {
                label: 'Start Test Run',
                icon: Play,
                onClick: onStartTestRun,
                variant: 'primary',
                show: testRun.status === 'PLANNED',
                loading: actionLoading && testRun.status === 'PLANNED',
              },
              {
                label: 'Complete Test Run',
                icon: Square,
                onClick: onCompleteTestRun,
                variant: 'primary',
                show: testRun.status === 'IN_PROGRESS',
                loading: actionLoading && testRun.status === 'IN_PROGRESS',
              },
            ]}
          />
        )}
      </div>
    </DetailCard>
  );
}
