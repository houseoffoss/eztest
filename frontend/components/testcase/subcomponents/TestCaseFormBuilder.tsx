'use client';

import { TestCaseFormField, FormFieldConfig } from './TestCaseFormField';
import { TestCaseFormData } from '../types';

interface TestCaseFormBuilderProps {
  fields: FormFieldConfig[];
  formData: TestCaseFormData;
  errors?: Record<string, string>;
  onFieldChange: (field: keyof TestCaseFormData, value: string | number | null) => void;
  onFormChange?: (data: Partial<TestCaseFormData>) => void;
  variant?: 'glass' | 'default';
  className?: string;
}

export function TestCaseFormBuilder({
  fields,
  formData,
  errors = {},
  onFieldChange,
  variant = 'glass',
  className = 'space-y-4',
}: TestCaseFormBuilderProps) {
  const handleChange = (fieldName: keyof TestCaseFormData, value: string | number | null) => {
    onFieldChange(fieldName, value);
  };

  return (
    <div className={className}>
      {fields.map((field) => (
        <TestCaseFormField
          key={field.name}
          {...field}
          value={formData[field.name as keyof TestCaseFormData] || ''}
          onChange={(value) =>
            handleChange(field.name as keyof TestCaseFormData, value)
          }
          error={errors[field.name]}
          variant={variant}
        />
      ))}
    </div>
  );
}
