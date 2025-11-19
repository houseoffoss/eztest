import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { Card, CardContent, CardHeader } from '@/elements/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/elements/dropdown-menu';
import { Calendar, MoreVertical, Play, Trash2, User } from 'lucide-react';
import { TestRun } from '../types';

interface TestRunCardProps {
  testRun: TestRun;
  onCardClick: () => void;
  onViewDetails: () => void;
  onDelete: () => void;
}

export function TestRunCard({
  testRun,
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

  return (
    <Card
      variant="glass"
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onCardClick}
    >
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-2 truncate">
              {testRun.name}
            </h3>
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
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <MoreVertical className="w-4 h-4" />
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
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-red-400"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="py-3 px-4">
        {testRun.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {testRun.description}
          </p>
        )}

        {/* Progress */}
        {testRun._count.results > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>Progress</span>
              <span>{passRate}% Passed</span>
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
        <div className="grid grid-cols-4 gap-2 mb-3">
          {counts.passed > 0 && (
            <div className="text-center">
              <div className="text-xs text-green-500 font-semibold">
                {counts.passed}
              </div>
              <div className="text-[10px] text-gray-500">Passed</div>
            </div>
          )}
          {counts.failed > 0 && (
            <div className="text-center">
              <div className="text-xs text-red-500 font-semibold">
                {counts.failed}
              </div>
              <div className="text-[10px] text-gray-500">Failed</div>
            </div>
          )}
          {counts.blocked > 0 && (
            <div className="text-center">
              <div className="text-xs text-orange-500 font-semibold">
                {counts.blocked}
              </div>
              <div className="text-[10px] text-gray-500">Blocked</div>
            </div>
          )}
          {counts.skipped > 0 && (
            <div className="text-center">
              <div className="text-xs text-gray-500 font-semibold">
                {counts.skipped}
              </div>
              <div className="text-[10px] text-gray-500">Skipped</div>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between text-xs text-gray-400">
            {testRun.assignedTo && (
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span className="truncate">{testRun.assignedTo.name}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{new Date(testRun.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
