import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { ItemCard } from '@/components/design/ItemCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/elements/dropdown-menu';
import { formatDateTime } from '@/lib/date-utils';
import { Calendar, MoreVertical, Play, Trash2, User } from 'lucide-react';
import { TestRun } from '../types';

interface TestRunCardProps {
  testRun: TestRun;
  canDelete?: boolean;
  onCardClick: () => void;
  onViewDetails: () => void;
  onDelete: () => void;
}

export function TestRunCard({
  testRun,
  canDelete = true,
  onCardClick,
  onViewDetails,
  onDelete,
}: TestRunCardProps) {
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

  const badges = (
    <>
      <Badge variant="outline" className={getStatusColor(testRun.status)}>
        {testRun.status.replace('_', ' ')}
      </Badge>
      {testRun.environment && (
        <Badge
          variant="outline"
          className="bg-purple-500/10 text-purple-500 border-purple-500/20"
        >
          {testRun.environment?.toUpperCase()}
        </Badge>
      )}
    </>
  );

  const header = (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mt-1 shrink-0 hover:bg-white/10"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent variant="glass" align="end">
        <DropdownMenuItem
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onViewDetails();
          }}
        >
          <Play className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        {canDelete && (
          <DropdownMenuItem
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-400 hover:bg-red-400/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const content = (
    <>
      {/* Progress */}
      {testRun._count.results > 0 && (
        <div className="mb-2.5">
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>Pass Rate</span>
            <span className="font-semibold text-white">{passRate}%</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all"
              style={{ width: `${passRate}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-2.5">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">
            {testRun._count.results}
          </div>
          <div className="text-xs text-white/60">Total</div>
        </div>
        {counts.passed > 0 && (
          <div className="text-center">
            <div className="text-2xl font-bold text-green-500">
              {counts.passed}
            </div>
            <div className="text-xs text-white/60">Passed</div>
          </div>
        )}
        {counts.failed > 0 && (
          <div className="text-center">
            <div className="text-2xl font-bold text-red-500">
              {counts.failed}
            </div>
            <div className="text-xs text-white/60">Failed</div>
          </div>
        )}
        {counts.blocked > 0 && (
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-500">
              {counts.blocked}
            </div>
            <div className="text-xs text-white/60">Blocked</div>
          </div>
        )}
      </div>
    </>
  );

  const footer = (
    <>
      <div className="flex items-center gap-2 text-xs text-white/60">
        {testRun.assignedTo && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate">{testRun.assignedTo.name}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 text-xs text-white/60">
        <Calendar className="w-3 h-3" />
        <span>{formatDateTime(testRun.createdAt)}</span>
      </div>
    </>
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
      borderColor="accent"
    />
  );
}
