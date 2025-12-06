'use client';

import { Badge } from '@/elements/badge';
import { Button } from '@/elements/button';
import { Checkbox } from '@/elements/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/elements/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/elements/hover-card';
import { MoreVertical, Trash2, Edit, UserPlus, RefreshCw, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export interface Defect {
  id: string;
  defectId: string;
  title: string;
  description: string | null;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'FIXED' | 'RETEST' | 'CLOSED' | 'REOPENED';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  testCase?: {
    id: string;
    tcId: string;
    title: string;
  } | null;
  testRun?: {
    id: string;
    name: string;
    email: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export type SortField = 'defectId' | 'title' | 'severity' | 'priority' | 'status' | 'assignedTo' | 'reporter';
export type SortOrder = 'asc' | 'desc';

interface DefectTableProps {
  defects: Defect[];
  selectedDefects: Set<string>;
  onSelectDefect: (defectId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onClick: (defectId: string) => void;
  onEdit?: (defect: Defect) => void;
  onDelete?: (defect: Defect) => void;
  onChangeStatus?: (defect: Defect) => void;
  onAssign?: (defect: Defect) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canAssign?: boolean;
  sortField?: SortField;
  sortOrder?: SortOrder;
  onSort?: (field: SortField) => void;
}

export function DefectTable({
  defects,
  selectedDefects,
  onSelectDefect,
  onSelectAll,
  onClick,
  onEdit,
  onDelete,
  onChangeStatus,
  onAssign,
  canEdit = true,
  canDelete = true,
  canAssign = true,
  sortField,
  sortOrder,
  onSort,
}: DefectTableProps) {
  const allSelected = defects.length > 0 && defects.every(d => selectedDefects.has(d.id));
  const someSelected = defects.some(d => selectedDefects.has(d.id)) && !allSelected;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'LOW':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'LOW':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'IN_PROGRESS':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'FIXED':
        return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'RETEST':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'CLOSED':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      case 'REOPENED':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 text-white/30" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1 text-primary" />
      : <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
  };

  return (
    <div className="space-y-2">
      {/* Header Row - Sticky */}
      <div
        className="sticky top-0 z-10 bg-[#0a1628]/95 backdrop-blur-sm grid gap-3 px-3 py-2 text-xs font-semibold text-white/60 border-b border-white/10"
        style={{ gridTemplateColumns: '40px 100px 2fr 110px 110px 110px 150px 150px 50px' }}
      >
        <div className="flex items-center justify-center">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onSelectAll}
            aria-label="Select all defects"
            className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
          />
        </div>
        <button 
          onClick={() => onSort?.('defectId')}
          className="flex items-center hover:text-white transition-colors cursor-pointer"
        >
          ID
          <SortIcon field="defectId" />
        </button>
        <button 
          onClick={() => onSort?.('title')}
          className="flex items-center hover:text-white transition-colors cursor-pointer"
        >
          TITLE
          <SortIcon field="title" />
        </button>
        <button 
          onClick={() => onSort?.('severity')}
          className="flex items-center hover:text-white transition-colors cursor-pointer"
        >
          SEVERITY
          <SortIcon field="severity" />
        </button>
        <button 
          onClick={() => onSort?.('priority')}
          className="flex items-center hover:text-white transition-colors cursor-pointer"
        >
          PRIORITY
          <SortIcon field="priority" />
        </button>
        <button 
          onClick={() => onSort?.('status')}
          className="flex items-center hover:text-white transition-colors cursor-pointer"
        >
          STATUS
          <SortIcon field="status" />
        </button>
        <button 
          onClick={() => onSort?.('assignedTo')}
          className="flex items-center hover:text-white transition-colors cursor-pointer"
        >
          ASSIGNEE
          <SortIcon field="assignedTo" />
        </button>
        <button 
          onClick={() => onSort?.('reporter')}
          className="flex items-center hover:text-white transition-colors cursor-pointer"
        >
          REPORTER
          <SortIcon field="reporter" />
        </button>
        <div></div>
      </div>

      {/* Defect Rows */}
      {defects.length === 0 ? (
        <div className="text-center py-8 text-white/50">
          No defects to display
        </div>
      ) : (
        defects.map((defect) => (
          <div
            key={defect.id}
            className={`grid gap-3 px-3 py-2.5 rounded hover:bg-white/5 border-b border-white/10 hover:border-blue-500/30 transition-colors items-center text-sm ${
              selectedDefects.has(defect.id) ? 'bg-primary/5 border-primary/20' : ''
            }`}
            style={{ gridTemplateColumns: '40px 100px 2fr 110px 110px 110px 150px 150px 50px' }}
          >
            {/* Checkbox Column */}
            <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selectedDefects.has(defect.id)}
                onCheckedChange={() => onSelectDefect(defect.id)}
                aria-label={`Select defect ${defect.defectId}`}
              />
            </div>

            {/* ID Column */}
            <div onClick={() => onClick(defect.id)} className="cursor-pointer">
              <p className="text-xs font-mono text-primary truncate">{defect.defectId}</p>
            </div>

            {/* Title Column */}
            <div onClick={() => onClick(defect.id)} className="min-w-0 cursor-pointer">
              <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                  <p className="text-sm font-medium text-white truncate">
                    {defect.title}
                  </p>
                </HoverCardTrigger>
                {defect.title && defect.title.length > 50 && (
                  <HoverCardContent side="top" className="w-96">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-white">Defect Title</h4>
                      <p className="text-sm text-white/80 break-words">{defect.title}</p>
                      {defect.description && (
                        <>
                          <h4 className="text-sm font-semibold text-white mt-3">Description</h4>
                          <p className="text-sm text-white/70 break-words line-clamp-3">{defect.description}</p>
                        </>
                      )}
                    </div>
                  </HoverCardContent>
                )}
              </HoverCard>
            </div>

            {/* Severity Column */}
            <div onClick={() => onClick(defect.id)} className="cursor-pointer">
              <Badge
                variant="outline"
                className={`w-fit text-xs px-2 py-0.5 ${getSeverityColor(defect.severity)}`}
              >
                {defect.severity}
              </Badge>
            </div>

            {/* Priority Column */}
            <div onClick={() => onClick(defect.id)} className="cursor-pointer">
              <Badge
                variant="outline"
                className={`w-fit text-xs px-2 py-0.5 ${getPriorityColor(defect.priority)}`}
              >
                {defect.priority}
              </Badge>
            </div>

            {/* Status Column */}
            <div onClick={() => onClick(defect.id)} className="cursor-pointer">
              <Badge
                variant="outline"
                className={`w-fit text-xs px-2 py-0.5 ${getStatusColor(defect.status)}`}
              >
                {defect.status.replace('_', ' ')}
              </Badge>
            </div>

            {/* Assignee Column */}
            <div onClick={() => onClick(defect.id)} className="min-w-0 cursor-pointer">
              {defect.assignedTo ? (
                <HoverCard openDelay={200}>
                  <HoverCardTrigger asChild>
                    <span className="text-xs text-white/70 truncate block">
                      {defect.assignedTo.name}
                    </span>
                  </HoverCardTrigger>
                  <HoverCardContent side="top" className="w-60">
                    <div className="space-y-1">
                      <h4 className="text-xs font-semibold text-white/60">Assigned To</h4>
                      <p className="text-sm text-white/90">{defect.assignedTo.name}</p>
                      <p className="text-xs text-white/60">{defect.assignedTo.email}</p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <span className="text-xs text-white/40 italic">Unassigned</span>
              )}
            </div>

            {/* Reporter Column */}
            <div onClick={() => onClick(defect.id)} className="min-w-0 cursor-pointer">
              <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                  <span className="text-xs text-white/70 truncate block">
                    {defect.createdBy.name}
                  </span>
                </HoverCardTrigger>
                <HoverCardContent side="top" className="w-60">
                  <div className="space-y-1">
                    <h4 className="text-xs font-semibold text-white/60">Reporter</h4>
                    <p className="text-sm text-white/90">{defect.createdBy.name}</p>
                    <p className="text-xs text-white/60">{defect.createdBy.email}</p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>

            {/* Actions Column */}
            <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/70 hover:text-white hover:bg-white/10 h-7 w-7 p-0 cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent variant="glass" align="end">
                  {canEdit && onEdit && (
                    <DropdownMenuItem
                      onClick={() => onEdit(defect)}
                      className="cursor-pointer"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Defect
                    </DropdownMenuItem>
                  )}
                  {onChangeStatus && (
                    <DropdownMenuItem
                      onClick={() => onChangeStatus(defect)}
                      className="cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Change Status
                    </DropdownMenuItem>
                  )}
                  {canAssign && onAssign && (
                    <DropdownMenuItem
                      onClick={() => onAssign(defect)}
                      className="cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign / Reassign
                    </DropdownMenuItem>
                  )}
                  {(canEdit || canAssign || onChangeStatus) && canDelete && <DropdownMenuSeparator />}
                  {canDelete && onDelete && (
                    <DropdownMenuItem
                      onClick={() => onDelete(defect)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
