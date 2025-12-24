'use client';

import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { Label } from '@/frontend/reusable-elements/labels/Label';
import { Textarea } from '@/frontend/reusable-elements/textareas/Textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/frontend/reusable-elements/selects/Select';

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
  maxLength?: number;
  cols?: 1 | 2 | 3;
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
  maxLength,
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
          className={`${baseInputClass} ${type === 'number' ? '[&::-webkit-outer-spin-button]:[appearance:none] [&::-webkit-inner-spin-button]:[appearance:none] [&]:[-moz-appearance:textfield]' : ''}`}
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
          maxLength={maxLength}
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
