'use client';

import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { Checkbox } from '@/frontend/reusable-elements/checkboxes/Checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/frontend/reusable-elements/dropdowns/DropdownMenu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/frontend/reusable-elements/hover-cards/HoverCard';
import { MoreVertical, Trash2, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { getDynamicBadgeProps } from '@/lib/badge-color-utils';

export interface Defect {
  id: string;
  defectId: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  priority: string;
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

export type SortField = 'defectId' | 'title' | 'severity' | 'priority' | 'status' | 'assignedTo' | 'reporter' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

interface DefectTableProps {
  defects: Defect[];
  selectedDefects: Set<string>;
  onSelectDefect: (defectId: string) => void;
  onSelectAll: (selected: boolean) => void;
  onClick: (defectId: string) => void;
  onDelete?: (defect: Defect) => void;
  canDelete?: boolean;
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
  onDelete,
  canDelete = true,
  sortField,
  sortOrder,
  onSort,
}: DefectTableProps) {
  const allSelected = defects.length > 0 && defects.every(d => selectedDefects.has(d.id));
  const someSelected = defects.some(d => selectedDefects.has(d.id)) && !allSelected;

  // Fetch dynamic dropdown options
  const { options: severityOptions } = useDropdownOptions('Defect', 'severity');
  const { options: priorityOptions } = useDropdownOptions('Defect', 'priority');
  const { options: statusOptions } = useDropdownOptions('Defect', 'status');

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 ml-1 text-white/30" />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1 text-primary" />
      : <ArrowDown className="w-3 h-3 ml-1 text-primary" />;
  };

  return (
    <div className="space-y-0">
      {/* Header Row - Sticky */}
      <div
        className="sticky top-0 z-10 bg-[#0a1628]/95 backdrop-blur-sm grid gap-3 px-3 py-2 text-xs font-semibold text-white/60 border-b border-white/10"
        style={{ gridTemplateColumns: '40px 100px 2fr 110px 110px 110px 150px 150px 50px' }}
      >
        <div className="flex items-center justify-center">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onSelectAll}
            aria-label="すべてのDefectを選択"
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
          タイトル
          <SortIcon field="title" />
        </button>
        <button 
          onClick={() => onSort?.('severity')}
          className="flex items-center hover:text-white transition-colors cursor-pointer"
        >
          深刻度
          <SortIcon field="severity" />
        </button>
        <button 
          onClick={() => onSort?.('priority')}
          className="flex items-center hover:text-white transition-colors cursor-pointer"
        >
          優先度
          <SortIcon field="priority" />
        </button>
        <button 
          onClick={() => onSort?.('status')}
          className="flex items-center hover:text-white transition-colors cursor-pointer"
        >
          ステータス
          <SortIcon field="status" />
        </button>
        <button 
          onClick={() => onSort?.('assignedTo')}
          className="flex items-center hover:text-white transition-colors cursor-pointer"
        >
          担当者
          <SortIcon field="assignedTo" />
        </button>
        <button 
          onClick={() => onSort?.('reporter')}
          className="flex items-center hover:text-white transition-colors cursor-pointer"
        >
          報告者
          <SortIcon field="reporter" />
        </button>
        <div></div>
      </div>

      {/* Defect Rows */}
      {defects.length === 0 ? (
        <div className="text-center py-8 text-white/50">
          表示するDefectがありません
        </div>
      ) : (
        defects.map((defect, rowIndex) => (
          <div
            key={defect.id}
            className={`grid gap-3 px-3 py-2.5 transition-colors items-center text-sm rounded-sm hover:bg-accent/20 ${
              rowIndex % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.04] border-b border-white/10'
            } ${
              selectedDefects.has(defect.id) ? 'bg-primary/5 border-primary/20' : ''
            }`}
            style={{ gridTemplateColumns: '40px 100px 2fr 110px 110px 110px 150px 150px 50px' }}
          >
            {/* Checkbox Column */}
            <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={selectedDefects.has(defect.id)}
                onCheckedChange={() => onSelectDefect(defect.id)}
                aria-label={`Defect ${defect.defectId} を選択`}
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
                      <h4 className="text-sm font-semibold text-white">Defectタイトル</h4>
                      <p className="text-sm text-white/80 break-words">{defect.title}</p>
                      {defect.description && (
                        <>
                          <h4 className="text-sm font-semibold text-white mt-3">説明</h4>
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
              {(() => {
                const badgeProps = getDynamicBadgeProps(defect.severity, severityOptions);
                const label = severityOptions.find(opt => opt.value === defect.severity)?.label || defect.severity;
                return (
                  <Badge
                    variant="outline"
                    className={`w-fit text-xs px-2 py-0.5 ${badgeProps.className}`}
                    style={badgeProps.style}
                  >
                    {label}
                  </Badge>
                );
              })()}
            </div>

            {/* Priority Column */}
            <div onClick={() => onClick(defect.id)} className="cursor-pointer">
              {(() => {
                const badgeProps = getDynamicBadgeProps(defect.priority, priorityOptions);
                const label = priorityOptions.find(opt => opt.value === defect.priority)?.label || defect.priority;
                return (
                  <Badge
                    variant="outline"
                    className={`w-fit text-xs px-2 py-0.5 ${badgeProps.className}`}
                    style={badgeProps.style}
                  >
                    {label}
                  </Badge>
                );
              })()}
            </div>

            {/* Status Column */}
            <div onClick={() => onClick(defect.id)} className="cursor-pointer">
              {(() => {
                const badgeProps = getDynamicBadgeProps(defect.status, statusOptions);
                const label = statusOptions.find(opt => opt.value === defect.status)?.label || defect.status.replace('_', ' ');
                return (
                  <Badge
                    variant="outline"
                    className={`w-fit text-xs px-2 py-0.5 ${badgeProps.className}`}
                    style={badgeProps.style}
                  >
                    {label}
                  </Badge>
                );
              })()}
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
              {canDelete && onDelete && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/70 hover:text-white hover:bg-white/10 h-5 w-5 p-0 cursor-pointer"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDelete(defect)} className="text-red-400 hover:bg-red-400/10">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

