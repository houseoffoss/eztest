'use client';

import { TestCaseFormField, FormFieldConfig } from './TestCaseFormField';

interface TestCaseFormBuilderProps<T = Record<string, unknown>> {
  fields: FormFieldConfig[];
  formData: T;
  errors?: Record<string, string>;
  onFieldChange: (field: keyof T, value: string | number | null) => void;
  onFormChange?: (data: Partial<T>) => void;
  variant?: 'glass' | 'default';
  className?: string;
}

export function TestCaseFormBuilder<T = Record<string, unknown>>({
  fields,
  formData,
  errors = {},
  onFieldChange,
  variant = 'glass',
  className = 'space-y-4',
}: TestCaseFormBuilderProps<T>) {
  const handleChange = (fieldName: keyof T, value: string | number | null) => {
    onFieldChange(fieldName, value);
  };

  // Determine if a field should span full width
  const shouldSpanFull = (field: FormFieldConfig) => {
    return field.name === 'expectedResult';
  };

  return (
    <div className={className}>
      {fields.map((field) => (
        <div
          key={field.name}
          className={shouldSpanFull(field) ? 'col-span-2' : ''}
        >
          <TestCaseFormField
            {...field}
            value={(formData[field.name as keyof T] as string | number | null) || ''}
            onChange={(value) =>
              handleChange(field.name as keyof T, value)
            }
            error={errors[field.name]}
            variant={variant}
          />
        </div>
      ))}
    </div>
  );
}
