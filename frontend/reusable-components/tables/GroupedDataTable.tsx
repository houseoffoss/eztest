'use client';

import { useState, ReactNode } from 'react';
import { ActionMenu } from '@/frontend/reusable-components/menus/ActionMenu';
import { ChevronDown, LucideIcon } from 'lucide-react';

export interface ColumnDef<T> {
  key: string;
  label: string;
  width?: string;
  render?: (row: T, index: number) => ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface GroupConfig<T> {
  getGroupId: (row: T) => string;
  getGroupName: (groupId: string, row?: T) => string;
  getGroupCount?: (groupId: string) => number | undefined;
  onGroupClick?: (groupId: string) => void;
  renderGroupHeader?: (groupId: string, groupName: string, count: number) => ReactNode;
  emptyGroups?: Array<{ id: string; name: string; count?: number }>;
}

export interface ActionConfig<T> {
  items: Array<{
    label: string;
    icon: LucideIcon;
    onClick: (row: T) => void;
    variant?: 'default' | 'destructive';
    show?: boolean | ((row: T) => boolean);
  }>;
  align?: 'start' | 'end';
  iconSize?: string;
}

export interface GroupedDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  onRowClick?: (row: T) => void;
  grouped?: boolean;
  groupConfig?: GroupConfig<T>;
  actions?: ActionConfig<T>;
  headerClassName?: string;
  rowClassName?: string;
  emptyMessage?: string;
  gridTemplateColumns?: string;
}

/**
 * Fully reusable grouped data table component
 * 
 * @example
 * ```tsx
 * const columns: ColumnDef<TestCase>[] = [
 *   { key: 'id', label: 'ID', width: '80px' },
 *   { key: 'title', label: 'Title', render: (row) => <span>{row.title}</span> },
 *   { key: 'priority', label: 'Priority', render: (row) => <PriorityBadge priority={row.priority} /> },
 * ];
 * 
 * <GroupedDataTable
 *   data={testCases}
 *   columns={columns}
 *   onRowClick={(row) => handleClick(row.id)}
 *   grouped={true}
 *   groupConfig={{
 *     getGroupId: (row) => row.moduleId || 'no-module',
 *     getGroupName: (id) => modules.find(m => m.id === id)?.name || 'Ungrouped',
 *   }}
 *   actions={{
 *     items: [
 *       { label: 'Delete', icon: Trash2, onClick: handleDelete, variant: 'destructive' }
 *     ]
 *   }}
 * />
 * ```
 */
export function GroupedDataTable<T = Record<string, unknown>>({
  data,
  columns,
  onRowClick,
  grouped = false,
  groupConfig,
  actions,
  headerClassName = '',
  rowClassName = '',
  emptyMessage = 'No data available',
  gridTemplateColumns,
}: GroupedDataTableProps<T>) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(groupId)) {
        newExpanded.delete(groupId);
      } else {
        newExpanded.add(groupId);
      }
      return newExpanded;
    });
  };

  // Calculate grid template columns if not provided
  const getGridColumns = () => {
    if (gridTemplateColumns) return gridTemplateColumns;
    
    const columnWidths = columns.map(col => col.width || '1fr');
    const actionColumn = actions ? '50px' : '';
    return [...columnWidths, actionColumn].filter(Boolean).join(' ');
  };

  // Group data if grouping is enabled
  const groupedData = grouped && groupConfig
    ? (() => {
        const groups: Record<string, { items: T[]; name: string; count?: number }> = {};

        // Group items from data
        data.forEach((row) => {
          const groupId = groupConfig.getGroupId(row);
          if (!groups[groupId]) {
            groups[groupId] = {
              items: [],
              name: groupConfig.getGroupName(groupId, row),
            };
          }
          groups[groupId].items.push(row);
        });

        // Add empty groups if provided
        if (groupConfig.emptyGroups) {
          groupConfig.emptyGroups.forEach((emptyGroup) => {
            if (!groups[emptyGroup.id]) {
              groups[emptyGroup.id] = {
                items: [],
                name: groupConfig.getGroupName(emptyGroup.id),
                count: emptyGroup.count,
              };
            } else if (emptyGroup.count !== undefined) {
              groups[emptyGroup.id].count = emptyGroup.count;
            }
          });
        }

        // Set counts for groups that have items
        Object.keys(groups).forEach((groupId) => {
          if (groups[groupId].count === undefined) {
            groups[groupId].count = groups[groupId].items.length;
          }
        });

        return groups;
      })()
    : null;

  // Render header row
  const renderHeader = () => (
    <div
      className={`grid gap-3 px-3 py-1.5 text-xs font-semibold text-white/60 border-b border-white/10 ${headerClassName}`}
      style={{ gridTemplateColumns: getGridColumns() }}
    >
      {columns.map((col) => (
        <div
          key={col.key}
          className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}
        >
          {col.label}
        </div>
      ))}
      {actions && <div></div>}
    </div>
  );

  // Render a single row
  const renderRow = (row: T, index: number) => {
    const actionItems = actions?.items.filter((item) => {
      if (item.show === false) return false;
      if (typeof item.show === 'function') return item.show(row);
      return true;
    }) || [];

    return (
      <div
        key={index}
        className={`grid gap-3 px-3 py-1.5 rounded hover:bg-white/5 border-b border-white/10 hover:border-blue-500/30 cursor-pointer transition-colors items-center text-sm ${rowClassName}`}
        style={{ gridTemplateColumns: getGridColumns() }}
        onClick={() => onRowClick?.(row)}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            className={`${col.className || ''} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}
          >
            {col.render ? col.render(row, index) : String((row as Record<string, unknown>)[col.key] || '')}
          </div>
        ))}
        {actions && (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            {actionItems.length > 0 && (
              <ActionMenu
                items={actionItems.map((item) => ({
                  label: item.label,
                  icon: item.icon as LucideIcon,
                  onClick: () => item.onClick(row),
                  variant: item.variant,
                }))}
                align={actions.align || 'end'}
                iconSize={actions.iconSize || 'w-3 h-3'}
              />
            )}
          </div>
        )}
      </div>
    );
  };

  // Render group header
  const renderGroupHeader = (groupId: string, groupName: string, count: number) => {
    const isExpanded = expandedGroups.has(groupId);
    const displayCount = count;

    if (groupConfig?.renderGroupHeader) {
      return groupConfig.renderGroupHeader(groupId, groupName, displayCount);
    }

    return (
      <div className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 border-b border-white/10 rounded transition-colors overflow-hidden">
        <button
          onClick={() => toggleGroup(groupId)}
          className="flex items-center gap-2 flex-1 text-left cursor-pointer min-w-0 overflow-hidden"
        >
          <ChevronDown
            className={`w-4 h-4 text-white/60 transition-transform flex-shrink-0 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
          <span className="min-w-0 flex-1 overflow-hidden max-w-[200px]">
            {groupConfig?.onGroupClick ? (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  groupConfig.onGroupClick?.(groupId);
                }}
                className="text-sm font-semibold text-blue-400 hover:text-blue-300 cursor-pointer truncate block"
                title={groupName}
              >
                {groupName}
              </span>
            ) : (
              <span className="text-sm font-semibold text-white/80 truncate block" title={groupName}>
                {groupName}
              </span>
            )}
          </span>
        </button>
        <span className="text-xs text-white/50 flex-shrink-0 whitespace-nowrap">
          ({displayCount} item{displayCount !== 1 ? 's' : ''})
        </span>
      </div>
    );
  };

  if (data.length === 0 && !groupedData) {
    return (
      <div className="text-center py-8 text-white/60">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {renderHeader()}

      {groupedData ? (
        // Grouped view
        Object.entries(groupedData).map(([groupId, { items, name, count }]) => {
          const isExpanded = expandedGroups.has(groupId);
          const displayCount = count !== undefined ? count : items.length;

          return (
            <div key={groupId} className="space-y-1">
              {renderGroupHeader(groupId, name, displayCount)}
              {isExpanded && items.length > 0 && (
                <div className="space-y-0.5">
                  {items.map((row, index) => renderRow(row, index))}
                </div>
              )}
            </div>
          );
        })
      ) : (
        // Ungrouped view
        data.map((row, index) => renderRow(row, index))
      )}
    </div>
  );
}

