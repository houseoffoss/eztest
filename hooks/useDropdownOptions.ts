import { useState, useEffect, useCallback } from 'react';

export interface DropdownOption {
  id: string;
  entity: string;
  field: string;
  value: string;
  label: string;
  color?: string | null;
  order: number;
  isActive: boolean;
}

interface UseDropdownOptionsResult {
  options: DropdownOption[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch dropdown options for a specific entity and field
 * 
 * @param entity - The entity name (e.g., "TestCase", "Defect")
 * @param field - The field name (e.g., "priority", "status")
 * @returns Object containing options, loading state, error, and refetch function
 * 
 * @example
 * const { options, loading } = useDropdownOptions('TestCase', 'priority');
 */
export function useDropdownOptions(entity: string, field: string): UseDropdownOptionsResult {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Add cache-busting timestamp to prevent stale data
      const timestamp = Date.now();
      const response = await fetch(
        `/api/dropdown-options?entity=${encodeURIComponent(entity)}&field=${encodeURIComponent(
          field
        )}&isActive=true&_t=${timestamp}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch dropdown options');
      }

      const data = await response.json();

      if (data.success) {
        setOptions(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch dropdown options');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [entity, field]);

  useEffect(() => {
    if (entity && field) {
      fetchOptions();
    }
  }, [entity, field, fetchOptions]);

  return {
    options,
    loading,
    error,
    refetch: fetchOptions,
  };
}

/**
 * Custom hook to fetch all grouped dropdown options
 * 
 * @returns Object containing grouped options, loading state, error, and refetch function
 */
export function useGroupedDropdownOptions() {
  const [groupedOptions, setGroupedOptions] = useState<
    Record<string, Record<string, DropdownOption[]>>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOptions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/dropdown-options/grouped');

      if (!response.ok) {
        throw new Error('Failed to fetch dropdown options');
      }

      const data = await response.json();

      if (data.success) {
        setGroupedOptions(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch dropdown options');
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setGroupedOptions({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  return {
    groupedOptions,
    loading,
    error,
    refetch: fetchOptions,
  };
}

