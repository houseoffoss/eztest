'use client';

import { SearchInput } from '@/components/design/SearchInput';
import { FilterDropdown, type FilterOption } from '@/components/design/FilterDropdown';

interface DefectFiltersProps {
  searchQuery: string;
  severityFilter: string;
  priorityFilter: string;
  statusFilter: string;
  assigneeFilter: string;
  onSearchChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onAssigneeChange: (value: string) => void;
  availableAssignees?: Array<{ id: string; name: string }>;
}

const severityOptions: FilterOption[] = [
  { value: 'all', label: 'All Severities' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const priorityOptions: FilterOption[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const statusOptions: FilterOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'NEW', label: 'New' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'FIXED', label: 'Fixed' },
  { value: 'TESTED', label: 'Tested' },
  { value: 'CLOSED', label: 'Closed' },
];

export function DefectFilters({
  searchQuery,
  severityFilter,
  priorityFilter,
  statusFilter,
  assigneeFilter,
  onSearchChange,
  onSeverityChange,
  onPriorityChange,
  onStatusChange,
  onAssigneeChange,
  availableAssignees = [],
}: DefectFiltersProps) {
  // Build assignee options from available assignees
  const assigneeOptions: FilterOption[] = [
    { value: 'all', label: 'All Assignees' },
    { value: 'unassigned', label: 'Unassigned' },
    ...availableAssignees.map((assignee) => ({
      value: assignee.id,
      label: assignee.name,
    })),
  ];

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="md:col-span-2">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search defects..."
          />
        </div>

        <div>
          <FilterDropdown
            value={severityFilter}
            onValueChange={onSeverityChange}
            placeholder="All Severities"
            options={severityOptions}
          />
        </div>

        <div>
          <FilterDropdown
            value={priorityFilter}
            onValueChange={onPriorityChange}
            placeholder="All Priorities"
            options={priorityOptions}
          />
        </div>

        <div>
          <FilterDropdown
            value={statusFilter}
            onValueChange={onStatusChange}
            placeholder="All Statuses"
            options={statusOptions}
          />
        </div>

        <div>
          <FilterDropdown
            value={assigneeFilter}
            onValueChange={onAssigneeChange}
            placeholder="All Assignees"
            options={assigneeOptions}
          />
        </div>
      </div>
    </div>
  );
}
