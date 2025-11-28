'use client';

import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { Card, CardContent, CardHeader } from '@/elements/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/elements/dropdown-menu';
import { Clock, MoreVertical, Trash2 } from 'lucide-react';
import { TestCase } from '../types';

interface TestCaseCardProps {
  testCase: TestCase;
  onDelete: (testCase: TestCase) => void;
  onClick: () => void;
}

export type { TestCaseCardProps };

export function TestCaseCard({ testCase, onDelete, onClick }: TestCaseCardProps) {
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
                className={getPriorityColor(testCase.priority)}
              >
                {testCase.priority}
              </Badge>
              <Badge
                variant="outline"
                className={getStatusColor(testCase.status)}
              >
                {testCase.status}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10 cursor-pointer">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent variant="glass" align="end">
              <DropdownMenuItem
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onDelete(testCase);
                }}
                className="text-red-400 hover:bg-red-400/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="py-3 px-4">
        {testCase.description && (
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
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
