'use client';

import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { Card, CardContent, CardHeader } from '@/frontend/reusable-elements/cards/Card';
import { ActionMenu } from '@/frontend/reusable-components/menus/ActionMenu';
import { Clock, Trash2 } from 'lucide-react';
import { TestCase } from '../types';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { getDynamicBadgeProps } from '@/lib/badge-color-utils';

interface TestCaseCardProps {
  testCase: TestCase;
  onDelete: (testCase: TestCase) => void;
  onClick: () => void;
}

export type { TestCaseCardProps };

export function TestCaseCard({ testCase, onDelete, onClick }: TestCaseCardProps) {
  const { options: priorityOptions } = useDropdownOptions('TestCase', 'priority');
  const { options: statusOptions } = useDropdownOptions('TestCase', 'status');

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'LOW':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'DRAFT':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'DEPRECATED':
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const priorityBadgeProps = getDynamicBadgeProps(testCase.priority, priorityOptions);
  const statusBadgeProps = getDynamicBadgeProps(testCase.status, statusOptions);

  // Get labels from dropdown options
  const priorityLabel = priorityOptions.find(opt => opt.value === testCase.priority)?.label || testCase.priority;
  const statusLabel = statusOptions.find(opt => opt.value === testCase.status)?.label || testCase.status;

  return (
    <Card
      variant="glass"
      className="cursor-pointer hover:border-blue-500/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white mb-2 truncate">
              {testCase.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className={priorityBadgeProps.className}
                style={priorityBadgeProps.style}
              >
                {priorityLabel}
              </Badge>
              <Badge
                variant="outline"
                className={statusBadgeProps.className}
                style={statusBadgeProps.style}
              >
                {statusLabel}
              </Badge>
            </div>
          </div>
          <ActionMenu
            items={[
              {
                label: 'Delete',
                icon: Trash2,
                onClick: () => onDelete(testCase),
                variant: 'destructive',
              },
            ]}
            align="end"
            buttonSize="sm"
            iconSize="w-4 h-4"
          />
        </div>
      </CardHeader>
      
      <CardContent className="py-3 px-4">
        {testCase.description && (
          <p className="text-sm text-gray-400 mb-3 break-words line-clamp-2">
            {testCase.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-400">
          {testCase.estimatedTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{testCase.estimatedTime}m</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span>{testCase._count.steps} steps</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{testCase._count.results} runs</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xs font-semibold text-white">
              {testCase.createdBy.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-400 truncate">
              {testCase.createdBy.name}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
