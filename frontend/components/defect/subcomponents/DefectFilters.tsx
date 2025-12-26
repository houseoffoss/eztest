'use client';

import { SearchInput } from '@/frontend/reusable-elements/inputs/SearchInput';
import { FilterDropdown, type FilterOption } from '@/frontend/reusable-components/inputs/FilterDropdown';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

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
  // Fetch dynamic dropdown options
  const { options: severityOptionsData } = useDropdownOptions('Defect', 'severity');
  const { options: priorityOptionsData } = useDropdownOptions('Defect', 'priority');
  const { options: statusOptionsData } = useDropdownOptions('Defect', 'status');

  // Map to FilterOption format with "All" option
  const severityOptions: FilterOption[] = [
    { value: 'all', label: 'All Severities' },
    ...severityOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];

  const priorityOptions: FilterOption[] = [
    { value: 'all', label: 'All Priorities' },
    ...priorityOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];

  const statusOptions: FilterOption[] = [
    { value: 'all', label: 'All Statuses' },
    ...statusOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];
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
