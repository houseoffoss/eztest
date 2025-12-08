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
  columns?: 1 | 2 | 3;
}

export function TestCaseFormBuilder<T = Record<string, unknown>>({
  fields,
  formData,
  errors = {},
  onFieldChange,
  variant = 'glass',
  columns = 1,
  className,
}: TestCaseFormBuilderProps<T>) {
  const handleChange = (fieldName: keyof T, value: string | number | null) => {
    onFieldChange(fieldName, value);
  };

  // Determine grid layout based on columns prop
  const gridClass = columns === 1 
    ? 'space-y-4' 
    : columns === 2 
    ? 'grid gap-4 grid-cols-2' 
    : 'grid gap-4 grid-cols-3';
  
  const finalClassName = className || gridClass;

  // Calculate field span based on field cols and grid columns
  const getFieldColSpan = (field: FormFieldConfig): string => {
    const fieldCols = field.cols || 1;
    if (columns === 1) return '';
    if (fieldCols >= columns) return `col-span-${columns}`;
    return `col-span-${fieldCols}`;
  };

  return (
    <div className={finalClassName}>
      {fields.map((field) => (
        <div
          key={field.name}
          className={getFieldColSpan(field)}
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
