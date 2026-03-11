'use client';

import { SearchInput } from '@/frontend/reusable-elements/inputs/SearchInput';
import { FilterDropdown, type FilterOption } from '@/frontend/reusable-components/inputs/FilterDropdown';
import { SearchableFilterDropdown } from '@/frontend/reusable-components/inputs/SearchableFilterDropdown';
import { useDropdownOptions } from '@/hooks/useDropdownOptions';
import { TEST_CASE_DOMAIN_OPTIONS, TEST_CASE_FUNCTION_NAME_OPTIONS } from '../constants';

interface TestCaseFiltersProps {
  searchQuery: string;
  statusFilter: string;
  domainFilter: string;
  functionNameFilter: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDomainChange: (value: string) => void;
  onFunctionNameChange: (value: string) => void;
}

export function TestCaseFilters({
  searchQuery,
  statusFilter,
  domainFilter,
  functionNameFilter,
  onSearchChange,
  onStatusChange,
  onDomainChange,
  onFunctionNameChange,
}: TestCaseFiltersProps) {
  // Fetch dynamic dropdown options
  const { options: statusOptionsData } = useDropdownOptions('TestCase', 'status');

  // Map to FilterOption format with "All" option
  const statusOptions: FilterOption[] = [
    { value: 'all', label: 'すべてのステータス' },
    ...statusOptionsData.map(opt => ({ value: opt.value, label: opt.label })),
  ];

  return (
    <div className="mb-6 w-full min-w-0">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 w-full min-w-0">
        <div className="sm:col-span-2 min-w-0">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="テストケースを検索..."
          />
        </div>

        <div className="min-w-0 w-full">
          <FilterDropdown
            value={statusFilter}
            onValueChange={onStatusChange}
            placeholder="ステータス"
            options={statusOptions}
          />
        </div>

        <div className="min-w-0 w-full">
          <SearchableFilterDropdown
            value={domainFilter}
            onValueChange={onDomainChange}
            options={TEST_CASE_DOMAIN_OPTIONS}
            placeholder="ドメイン"
            allLabel="すべてのドメイン"
            searchPlaceholder="ドメインを検索..."
          />
        </div>

        <div className="min-w-0 w-full">
          <SearchableFilterDropdown
            value={functionNameFilter}
            onValueChange={onFunctionNameChange}
            options={TEST_CASE_FUNCTION_NAME_OPTIONS}
            placeholder="機能"
            allLabel="すべての機能"
            searchPlaceholder="機能を検索..."
          />
        </div>
      </div>
    </div>
  );
}
