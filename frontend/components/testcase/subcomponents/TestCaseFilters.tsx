'use client';

import { SearchInput } from '@/components/design/SearchInput';
import { FilterDropdown, type FilterOption } from '@/components/design/FilterDropdown';

interface TestCaseFiltersProps {
  searchQuery: string;
  priorityFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onPriorityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const priorityOptions: FilterOption[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

const statusOptions: FilterOption[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'DEPRECATED', label: 'Deprecated' },
];

export function TestCaseFilters({
  searchQuery,
  priorityFilter,
  statusFilter,
  onSearchChange,
  onPriorityChange,
  onStatusChange,
}: TestCaseFiltersProps) {
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search test cases..."
          />
        </div>

        <div>
          <FilterDropdown
            value={priorityFilter}
            onValueChange={onPriorityChange}
            placeholder="Priority"
            options={priorityOptions}
          />
        </div>

        <div>
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
