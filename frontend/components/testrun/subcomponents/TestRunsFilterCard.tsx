'use client';

import { SearchInput } from '@/frontend/reusable-elements/inputs/SearchInput';
import { FilterDropdown, type FilterOption } from '@/frontend/reusable-components/inputs/FilterDropdown';
import { TestRunFilters } from '../types';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';

interface TestRunsFilterCardProps {
  filters: TestRunFilters;
  assignedToOptions: FilterOption[];
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: string) => void;
  onEnvironmentFilterChange: (environment: string) => void;
  onAssignedToFilterChange: (assignedToId: string) => void;
}

export function TestRunsFilterCard({
  filters,
  assignedToOptions,
  onSearchChange,
  onStatusFilterChange,
  onEnvironmentFilterChange,
  onAssignedToFilterChange,
}: TestRunsFilterCardProps) {
  // Fetch dynamic dropdown options
  const { options: statusOptionsData } = useDropdownOptions('TestRun', 'status');
  const { options: environmentOptionsData } = useDropdownOptions('TestRun', 'environment');

  // Map to FilterOption format with "All" option
  const statusOptions: FilterOption[] = [
    { value: 'all', label: 'Все статусы' },
    ...statusOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];

  const environmentOptions: FilterOption[] = [
    { value: 'all', label: 'Все окружения' },
    ...environmentOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];
  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="md:col-span-2">
          <SearchInput
            value={filters.searchQuery}
            onChange={onSearchChange}
            placeholder="Поиск тест-ранов..."
          />
        </div>

        <div>
          <FilterDropdown
            value={filters.statusFilter}
            onValueChange={onStatusFilterChange}
            placeholder="Статус"
            options={statusOptions}
          />
        </div>

        <div>
          <FilterDropdown
            value={filters.environmentFilter}
            onValueChange={onEnvironmentFilterChange}
            placeholder="Окружение"
            options={environmentOptions}
          />
        </div>

        <div>
          <FilterDropdown
            value={filters.assignedToFilter}
            onValueChange={onAssignedToFilterChange}
            placeholder="Назначен"
            options={assignedToOptions}
          />
        </div>
      </div>
    </div>
  );
}
