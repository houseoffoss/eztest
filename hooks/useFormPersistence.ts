import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for persisting form data across tab navigations
 * Uses sessionStorage to save and restore form state
 * 
 * @param formKey - Unique identifier for the form (e.g., 'create-test-case', 'login-form')
 * @param initialData - Initial form data structure
 * @param options - Configuration options
 * @returns Tuple of [formData, setFormData, clearFormData]
 * 
 * @example
 * const [formData, setFormData, clearFormData] = useFormPersistence('create-project', {
 *   name: '',
 *   description: ''
 * });
 */
export function useFormPersistence<T extends Record<string, unknown>>(
  formKey: string,
  initialData: T,
  options?: {
    /** Clear form data after this many milliseconds of inactivity (default: 1 hour) */
    expiryMs?: number;
    /** Exclude specific fields from persistence */
    excludeFields?: (keyof T)[];
    /** Enable/disable persistence (default: true) */
    enabled?: boolean;
  }
) {
  const {
    expiryMs = 60 * 60 * 1000, // 1 hour default
    excludeFields = [],
    enabled = true,
  } = options || {};

  const storageKey = `form_${formKey}`;
  const timestampKey = `form_${formKey}_timestamp`;

  // Initialize form data from sessionStorage or use initial data
  const [formData, setFormDataState] = useState<T>(() => {
    if (!enabled || typeof window === 'undefined') {
      return initialData;
    }

    try {
      const savedData = sessionStorage.getItem(storageKey);
      const savedTimestamp = sessionStorage.getItem(timestampKey);

      if (savedData && savedTimestamp) {
        const timestamp = parseInt(savedTimestamp, 10);
        const now = Date.now();

        // Check if saved data has expired
        if (now - timestamp < expiryMs) {
          const parsed = JSON.parse(savedData);
          
          // Merge saved data with initial data to handle new fields
          return { ...initialData, ...parsed };
        } else {
          // Clear expired data
          sessionStorage.removeItem(storageKey);
          sessionStorage.removeItem(timestampKey);
        }
      }
    } catch (error) {
      console.error('Error loading form data from sessionStorage:', error);
      // Clear potentially corrupted data
      sessionStorage.removeItem(storageKey);
      sessionStorage.removeItem(timestampKey);
    }

    return initialData;
  });

  // Save to sessionStorage whenever formData changes
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') {
      return;
    }

    try {
      // Create a copy without excluded fields
      const dataToSave = { ...formData };
      excludeFields.forEach((field) => {
        delete dataToSave[field];
      });

      sessionStorage.setItem(storageKey, JSON.stringify(dataToSave));
      sessionStorage.setItem(timestampKey, Date.now().toString());
    } catch (error) {
      console.error('Error saving form data to sessionStorage:', error);
    }
  }, [formData, storageKey, timestampKey, excludeFields, enabled]);

  // Enhanced setFormData that works like setState
  const setFormData = useCallback((
    update: T | ((prev: T) => T)
  ) => {
    setFormDataState(update);
  }, []);

  // Clear form data from both state and storage
  const clearFormData = useCallback(() => {
    setFormDataState(initialData);
    
    if (enabled && typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(storageKey);
        sessionStorage.removeItem(timestampKey);
      } catch (error) {
        console.error('Error clearing form data from sessionStorage:', error);
      }
    }
  }, [storageKey, timestampKey, initialData, enabled]);

  // Reset to initial data without clearing storage (useful for resetting a single field)
  const resetFormData = useCallback(() => {
    setFormDataState(initialData);
  }, [initialData]);

  return [formData, setFormData, clearFormData, resetFormData] as const;
}

/**
 * Utility to manually clear a specific form's persisted data
 * Useful for cleanup after successful form submission
 */
export function clearPersistedForm(formKey: string) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.removeItem(`form_${formKey}`);
    sessionStorage.removeItem(`form_${formKey}_timestamp`);
  } catch (error) {
    console.error('Error clearing persisted form:', error);
  }
}

/**
 * Utility to check if a form has persisted data
 */
export function hasPersistedData(formKey: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const data = sessionStorage.getItem(`form_${formKey}`);
    return data !== null;
  } catch {
    return false;
  }
}

/**
 * Utility to clear all persisted form data
 * Useful for sign-out or clearing user session data
 */
export function clearAllPersistedForms(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const keysToRemove: string[] = [];
    
    // Find all form-related keys in sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith('form_'))) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all form-related keys
    keysToRemove.forEach(key => {
      sessionStorage.removeItem(key);
    });
    
    console.log(`Cleared ${keysToRemove.length} persisted form(s)`);
  } catch (error) {
    console.error('Error clearing all persisted forms:', error);
  }
}
