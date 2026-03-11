import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { DetailCard } from '@/frontend/reusable-components/cards/DetailCard';
import { ActionButtonGroup } from '@/frontend/reusable-components/layout/ActionButtonGroup';
import { Play, Square, RotateCcw, User, Timer, Pencil } from 'lucide-react';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { getDynamicBadgeProps } from '@/lib/badge-color-utils';

interface TestRunHeaderProps {
  testRun: {
    name: string;
    description?: string;
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    environment?: string;
    version?: string;
    platform?: string;
    device?: string;
    assignedTo?: {
      id: string;
      name: string;
      email: string;
    } | null;
    project: {
      id: string;
    };
  };
  executionTypeLabel?: string;
  actionLoading: boolean;
  canUpdate?: boolean;
  onEditTestRun?: () => void;
  onStartTestRun: () => void;
  onCompleteTestRun: () => void;
  onReopenTestRun?: () => void;
  totalExecutionTime?: number; // 秒単位の総計
}

export function TestRunHeader({
  testRun,
  executionTypeLabel,
  actionLoading,
  canUpdate = true,
  onEditTestRun,
  onStartTestRun,
  onCompleteTestRun,
  onReopenTestRun,
  totalExecutionTime = 0,
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
  const versionLabel = testRun.version?.trim() || '未設定';

  // Determine execution type badge color based on label
  const executionTypeBadgeClassName = executionTypeLabel === 'AUTOMATION'
    ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    : 'bg-blue-500/10 text-blue-500 border-blue-500/20';

  return (
    <DetailCard
      title={testRun.name}
      description={testRun.description}
      contentClassName="space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-white/60">ステータス:</span>
            <Badge 
              variant="outline" 
              className={statusBadgeProps.className}
              style={statusBadgeProps.style}
            >
              {statusLabel}
            </Badge>
          </div>
          {executionTypeLabel && (
            <div className="flex items-center gap-2">
              <span className="text-white/60">実行種別:</span>
              <Badge variant="outline" className={executionTypeBadgeClassName}>
                {executionTypeLabel}
              </Badge>
            </div>
          )}
          {testRun.environment && environmentBadgeProps && (
            <div className="flex items-center gap-2">
              <span className="text-white/60">環境:</span>
              <Badge
                variant="outline"
                className={environmentBadgeProps.className}
                style={environmentBadgeProps.style}
              >
                {environmentLabel}
              </Badge>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-white/60">バージョン:</span>
            <Badge
              variant="outline"
              className={
                testRun.version
                  ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
              }
            >
              {versionLabel}
            </Badge>
          </div>
          {testRun.platform && (
            <div className="flex items-center gap-2">
              <span className="text-white/60">プラットフォーム:</span>
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
                {testRun.platform}
              </Badge>
            </div>
          )}
          {testRun.device && (
            <div className="flex items-center gap-2">
              <span className="text-white/60">端末:</span>
              <Badge variant="outline" className="bg-teal-500/10 text-teal-500 border-teal-500/20">
                {testRun.device}
              </Badge>
            </div>
          )}
          {testRun.assignedTo && (
            <div className="flex items-center gap-2">
              <span className="text-white/60">テスター:</span>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                <User className="w-3 h-3 mr-1" />
                {testRun.assignedTo.name}
              </Badge>
            </div>
          )}
          {totalExecutionTime > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-white/60">テスト実行時間（総計）:</span>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                <Timer className="w-3 h-3 mr-1" />
                {String(Math.floor(totalExecutionTime / 3600)).padStart(2, '0')}:
                {String(Math.floor((totalExecutionTime % 3600) / 60)).padStart(2, '0')}:
                {String(totalExecutionTime % 60).padStart(2, '0')}
              </Badge>
            </div>
          )}
        </div>

        {canUpdate && (
          <ActionButtonGroup
            buttons={[
              {
                label: 'テストランを編集',
                icon: Pencil,
                onClick: onEditTestRun || (() => {}),
                variant: 'secondary',
                show: !!onEditTestRun,
                loading: false,
              },
              {
                label: 'テストランを開始',
                icon: Play,
                onClick: onStartTestRun,
                variant: 'primary',
                show: testRun.status === 'PLANNED',
                loading: actionLoading && testRun.status === 'PLANNED',
              },
              {
                label: 'テストランを完了',
                icon: Square,
                onClick: onCompleteTestRun,
                variant: 'primary',
                show: testRun.status === 'IN_PROGRESS',
                loading: actionLoading && testRun.status === 'IN_PROGRESS',
              },
              {
                label: 'テストランを再開',
                icon: RotateCcw,
                onClick: onReopenTestRun || (() => {}),
                variant: 'secondary',
                show: testRun.status === 'COMPLETED' && !!onReopenTestRun,
                loading: actionLoading && testRun.status === 'COMPLETED',
              },
            ]}
          />
        )}
      </div>
    </DetailCard>
  );
}
