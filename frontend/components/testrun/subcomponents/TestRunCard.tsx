import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { ItemCard } from '@/frontend/reusable-components/cards/ItemCard';
import { ActionMenu } from '@/frontend/reusable-components/menus/ActionMenu';
import { ProgressBarWithLabel } from '@/frontend/reusable-components/data/ProgressBarWithLabel';
import { CompactStatsGrid } from '@/frontend/reusable-components/data/CompactStatsGrid';
import { CardFooter } from '@/frontend/reusable-components/layout/CardFooter';
import { Calendar, Play, Trash2, User, Pencil } from 'lucide-react';
import { TestRun } from '../types';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { getDynamicBadgeProps } from '@/lib/badge-color-utils';

interface TestRunCardProps {
  testRun: TestRun;
  canUpdate?: boolean;
  canDelete?: boolean;
  onCardClick: () => void;
  onViewDetails: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function TestRunCard({
  testRun,
  canUpdate = true,
  canDelete = true,
  onCardClick,
  onViewDetails,
  onEdit,
  onDelete,
}: TestRunCardProps) {
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

  const calculatePassRate = () => {
    const total = testRun._count.results;
    if (total === 0) return 0;

    const passed = testRun.results.filter((r) => r.status === 'PASSED').length;
    return Math.round((passed / total) * 100);
  };

  const getResultCounts = () => {
    const counts = {
      passed: 0,
      failed: 0,
      blocked: 0,
      skipped: 0,
    };

    testRun.results.forEach((result) => {
      switch (result.status) {
        case 'PASSED':
          counts.passed++;
          break;
        case 'FAILED':
          counts.failed++;
          break;
        case 'BLOCKED':
          counts.blocked++;
          break;
        case 'SKIPPED':
          counts.skipped++;
          break;
      }
    });

    return counts;
  };

  const passRate = calculatePassRate();
  const counts = getResultCounts();

  const statusBadgeProps = getDynamicBadgeProps(testRun.status, statusOptions);
  const environmentBadgeProps = testRun.environment 
    ? getDynamicBadgeProps(testRun.environment, environmentOptions)
    : null;

  // Get labels from dropdown options
  const statusLabel = statusOptions.find(opt => opt.value === testRun.status)?.label || testRun.status.replace('_', ' ');
  const environmentLabel = testRun.environment 
    ? (environmentOptions.find(opt => opt.value === testRun.environment)?.label || testRun.environment.toUpperCase())
    : null;

  const executionTypeLabel =
    (testRun.executionType || 'MANUAL').toString().toUpperCase() === 'AUTOMATION'
      ? 'AUTOMATION'
      : 'MANUAL';
  
  const executionType = (testRun.executionType || 'MANUAL').toString().toUpperCase();
  const executionTypeBadgeClassName = executionType === 'AUTOMATION'
    ? 'bg-purple-500/10 text-purple-500 border-purple-500/20'
    : 'bg-blue-500/10 text-blue-500 border-blue-500/20';

  const badges = (
    <>
      <Badge 
        variant="outline" 
        className={statusBadgeProps.className}
        style={statusBadgeProps.style}
      >
        {statusLabel}
      </Badge>
      <Badge variant="outline" className={executionTypeBadgeClassName}>
        {executionTypeLabel}
      </Badge>
      {testRun.environment && environmentBadgeProps && (
        <Badge
          variant="outline"
          className={environmentBadgeProps.className}
          style={environmentBadgeProps.style}
        >
          {environmentLabel}
        </Badge>
      )}
      {testRun.version && (
        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
          {testRun.version}
        </Badge>
      )}
      {testRun.platform && (
        <Badge variant="outline" className="bg-cyan-500/10 text-cyan-500 border-cyan-500/20">
          {testRun.platform}
        </Badge>
      )}
      {testRun.device && (
        <Badge variant="outline" className="bg-teal-500/10 text-teal-500 border-teal-500/20">
          {testRun.device}
        </Badge>
      )}
    </>
  );

  const header = (
    <ActionMenu
      items={[
        {
          label: '詳細を見る',
          icon: Play,
          onClick: onViewDetails,
          buttonName: `Test Run Card - View Details (${testRun.name})`,
        },
        {
          label: '編集',
          icon: Pencil,
          onClick: onEdit,
          show: canUpdate,
          buttonName: `Test Run Card - Edit (${testRun.name})`,
        },
        {
          label: '削除',
          icon: Trash2,
          onClick: onDelete,
          variant: 'destructive',
          show: canDelete,
          buttonName: `Test Run Card - Delete (${testRun.name})`,
        },
      ]}
      align="end"
      iconSize="w-3.5 h-3.5"
    />
  );

  const content = (
    <>
      {/* Progress */}
      {testRun._count.results > 0 && (
        <ProgressBarWithLabel
          label="合格率"
          value={passRate}
          fillClassName="bg-green-400/30 border border-green-400/30"
        />
      )}

      {/* Stats */}
      <CompactStatsGrid
        stats={[
          {
            value: testRun._count.results,
            label: '合計',
            show: true,
          },
          {
            value: counts.passed,
            label: '合格',
            valueClassName: 'text-green-500',
            show: counts.passed > 0,
          },
          {
            value: counts.failed,
            label: '不合格',
            valueClassName: 'text-red-500',
            show: counts.failed > 0,
          },
          {
            value: counts.blocked,
            label: 'ブロック',
            valueClassName: 'text-orange-500',
            show: counts.blocked > 0,
          },
        ]}
        columns={4}
        gap="md"
        className="mb-2.5"
      />
    </>
  );

  const footer = (
    <CardFooter
      items={[
        ...(testRun.assignedTo
          ? [
              {
                icon: User,
                value: testRun.assignedTo.name,
              },
            ]
          : []),
        {
          icon: Calendar,
          value: testRun.createdAt,
          formatDate: true,
        },
      ]}
    />
  );

  return (
    <ItemCard
      title={testRun.name}
      description={testRun.description || undefined}
      descriptionClassName="line-clamp-2 break-words"
      badges={badges}
      header={header}
      content={content}
      footer={footer}
      onClick={onCardClick}
      borderColor="primary"
    />
  );
}
