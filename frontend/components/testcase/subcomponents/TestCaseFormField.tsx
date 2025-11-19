'use client';

import { Input } from '@/elements/input';
import { Label } from '@/elements/label';
import { Textarea } from '@/elements/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/elements/select';

export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'email';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  options?: SelectOption[];
  error?: string;
}

interface TestCaseFormFieldProps extends FormFieldConfig {
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  variant?: 'glass' | 'default';
}

export function TestCaseFormField({
  name,
  label,
  type,
  placeholder,
  required,
  rows,
  options,
  error,
  value,
  onChange,
  variant = 'glass',
}: TestCaseFormFieldProps) {
  const baseInputClass = 'w-full';

  if (type === 'text' || type === 'email' || type === 'number') {
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          id={name}
          type={type}
          variant={variant}
          value={value || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const val =
              type === 'number' ? parseInt(e.target.value) || '' : e.target.value;
            onChange(val);
          }}
          placeholder={placeholder}
          className={baseInputClass}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Textarea
          id={name}
          variant={variant}
          value={value || ''}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            onChange(e.target.value)
          }
          placeholder={placeholder}
          rows={rows || 3}
          className={baseInputClass}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  if (type === 'select') {
    return (
      <div className="space-y-2">
        <Label htmlFor={name}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Select
          value={value === null || value === undefined ? 'none' : String(value)}
          onValueChange={(val) => onChange(val === 'none' ? null : val)}
        >
          <SelectTrigger variant={variant} id={name} className={baseInputClass}>
            <SelectValue placeholder={placeholder || `Select ${label}`} />
          </SelectTrigger>
          <SelectContent variant={variant}>
            {options?.map((option) => (
              <SelectItem key={option.value} value={String(option.value)}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return null;
}
