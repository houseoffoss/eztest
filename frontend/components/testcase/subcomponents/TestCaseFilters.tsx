'use client';

import { SearchInput } from '@/frontend/reusable-elements/inputs/SearchInput';
import { FilterDropdown, type FilterOption } from '@/frontend/reusable-components/inputs/FilterDropdown';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

interface TestCaseFiltersProps {
  searchQuery: string;
  priorityFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function TestCaseFilters({
  searchQuery,
  priorityFilter,
  statusFilter,
  onSearchChange,
  onPriorityChange,
  onStatusChange,
}: TestCaseFiltersProps) {
  // Fetch dynamic dropdown options
  const { options: priorityOptionsData } = useDropdownOptions('TestCase', 'priority');
  const { options: statusOptionsData } = useDropdownOptions('TestCase', 'status');

  // Map to FilterOption format with "All" option
  const priorityOptions: FilterOption[] = [
    { value: 'all', label: 'All Priorities' },
    ...priorityOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];

  const statusOptions: FilterOption[] = [
    { value: 'all', label: 'All Statuses' },
    ...statusOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];
  return (
    <div className="mb-6 w-full min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full min-w-0">
        <div className="sm:col-span-2 min-w-0">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search test cases..."
          />
        </div>

        <div className="min-w-0 w-full">
          <FilterDropdown
            value={priorityFilter}
            onValueChange={onPriorityChange}
            placeholder="Priority"
            options={priorityOptions}
          />
        </div>

        <div className="min-w-0 w-full">
          <FilterDropdown
            value={statusFilter}
            onValueChange={onStatusChange}
            placeholder="Status"
            options={statusOptions}
          />
        </div>
      </div>
    </div>
  );
}
