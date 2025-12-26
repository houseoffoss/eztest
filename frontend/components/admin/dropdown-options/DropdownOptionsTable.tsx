'use client';

import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { GroupedDataTable, ColumnDef, GroupConfig, ActionConfig } from '@/frontend/reusable-components/tables/GroupedDataTable';
import { Edit2 } from 'lucide-react';
import { DropdownOption } from './types';

interface DropdownField {
  entity: string;
  field: string;
  options: DropdownOption[];
}

interface DropdownOptionsTableProps {
  groupedOptions: Record<string, Record<string, DropdownOption[]>>;
  onEdit: (entity: string, field: string, options: DropdownOption[]) => void;
}

/**
 * Get a consistent color for any dropdown option value
 * Uses a hash function to generate unique colors dynamically
 */
const getOptionColor = (value: string): { bg: string; text: string; border: string } => {
  // Color palette - alternating between different color schemes
  const colorPalettes = [
    { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
    { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    { bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/30' },
    { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
    { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
    { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
    { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30' },
    { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
    { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  ];

  // Simple hash function to generate a number from string
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  // Use absolute value and modulo to get index
  const index = Math.abs(hash) % colorPalettes.length;
  return colorPalettes[index];
};

/**
 * Dropdown options table component with entity grouping
 * Uses the reusable GroupedDataTable component
 */
export function DropdownOptionsTable({
  groupedOptions,
  onEdit,
}: DropdownOptionsTableProps) {
  // Flatten grouped options into flat array for the table
  const flattenedData: DropdownField[] = [];
  Object.entries(groupedOptions).forEach(([entity, fields]) => {
    Object.entries(fields).forEach(([field, options]) => {
      flattenedData.push({ entity, field, options });
    });
  });

  const formatFieldName = (field: string): string => {
    return field
      .split(/(?=[A-Z])/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatEntityName = (entity: string): string => {
    return entity
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Define columns
  const columns: ColumnDef<DropdownField>[] = [
    {
      key: 'field',
      label: 'FIELD NAME',
      width: '200px',
      render: (row) => (
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-white">
            {formatFieldName(row.field)}
          </p>
        </div>
      ),
    },
    {
      key: 'options',
      label: 'OPTIONS',
      render: (row) => (
        <div className="flex flex-wrap gap-2 py-1">
          {row.options
            .filter((opt) => opt.isActive)
            .sort((a, b) => a.order - b.order)
            .map((option) => {
              const colors = getOptionColor(option.value);
              return (
                <Badge
                  key={option.id}
                  variant="outline"
                  className={`${colors.bg} ${colors.text} ${colors.border}`}
                >
                  {option.label}
                </Badge>
              );
            })}
          {row.options.filter((opt) => opt.isActive).length === 0 && (
            <span className="text-sm text-white/40">No active options</span>
          )}
        </div>
      ),
    },
    {
      key: 'count',
      label: 'COUNT',
      width: '80px',
      align: 'center',
      render: (row) => (
        <Badge variant="secondary">
          {row.options.length}
        </Badge>
      ),
    },
  ];

  // Group config
  const groupConfig: GroupConfig<DropdownField> = {
    getGroupId: (row) => row.entity,
    getGroupName: (groupId) => formatEntityName(groupId),
    getGroupCount: (groupId) => {
      return Object.keys(groupedOptions[groupId] || {}).length;
    },
  };

  // Actions config
  const actions: ActionConfig<DropdownField> = {
    items: [
      {
        label: 'Edit Options',
        icon: Edit2,
        onClick: (row) => onEdit(row.entity, row.field, row.options),
        variant: 'default',
      },
    ],
    align: 'end',
  };

  return (
    <GroupedDataTable
      data={flattenedData}
      columns={columns}
      grouped={true}
      groupConfig={groupConfig}
      actions={actions}
      emptyMessage="No dropdown options found. Run the seed script to populate dropdown options."
      gridTemplateColumns="200px 1fr 80px 50px"
    />
  );
}

