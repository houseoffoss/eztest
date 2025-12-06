'use client';

import { useState, useEffect, ReactNode } from 'react';
import { Button } from '@/elements/button';
import { ButtonPrimary } from '@/elements/button-primary';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/elements/dialog';
import { Input } from '@/elements/input';
import { Textarea } from '@/elements/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/elements/select';
import { FloatingAlert, type FloatingAlertMessage } from '@/components/utils/FloatingAlert';
import { InlineError } from '@/components/utils/InlineError';
import { useFormPersistence } from '@/hooks/useFormPersistence';

export interface BaseDialogField {
  name: string;
  label: string;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'email' | 'password' | 'number' | 'select' | 'date' | 'custom';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  rows?: number; // For textarea
  cols?: number; // Column span: 1 or 2
  options?: Array<{ value: string; label: string }>; // For select type
  transform?: 'uppercase' | 'lowercase' | 'capitalize'; // Text transformation
  defaultValue?: string; // Default value for the field
  validate?: (value: string, formData?: Record<string, string>) => string | undefined; // Custom validation function
  min?: number; // For number type
  max?: number; // For number type
  readOnly?: boolean; // Make field read-only
  customRender?: (value: string, onChange: (value: string) => void) => React.ReactNode; // Custom field renderer
}

export interface BaseDialogConfig<T = unknown> {
  title: string;
  description?: string;
  fields: BaseDialogField[];
  submitLabel?: string;
  cancelLabel?: string;
  triggerOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSubmit: (formData: Record<string, string>) => Promise<T>;
  onSuccess?: (result?: T) => void;
  children?: ReactNode; // For custom content before form
  /** Unique key for form persistence (auto-generated if not provided) */
  formPersistenceKey?: string;
  /** Disable form persistence (default: false) */
  disablePersistence?: boolean;
}

export const BaseDialog = <T = unknown,>({
  title,
  description,
  fields,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  triggerOpen = false,
  onOpenChange,
  onSubmit,
  onSuccess,
  children,
  formPersistenceKey,
  disablePersistence = false,
}: BaseDialogConfig<T>) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState<FloatingAlertMessage | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validate a single field
  const validateField = (field: BaseDialogField, value: string, currentFormData?: Record<string, string>): string | undefined => {
    const dataToUse = currentFormData || formData;
    
    // Custom validation function takes priority
    if (field.validate) {
      return field.validate(value, dataToUse);
    }

    // Required validation
    if (field.required && !value.trim()) {
      return `${field.label} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value.trim() && !field.required) {
      return undefined;
    }

    // Email validation
    if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    // Min/Max length validation
    if (field.minLength && value.trim().length < field.minLength) {
      return `${field.label} must be at least ${field.minLength} characters`;
    }
    if (field.maxLength && value.trim().length > field.maxLength) {
      return `${field.label} must be less than ${field.maxLength} characters`;
    }

    // Number validation
    if (field.type === 'number') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return `${field.label} must be a valid number`;
      }
      if (field.min !== undefined && numValue < field.min) {
        return `${field.label} must be at least ${field.min}`;
      }
      if (field.max !== undefined && numValue > field.max) {
        return `${field.label} must be at most ${field.max}`;
      }
    }

    // Date validation
    if (field.type === 'date' && value) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(value)) {
        return 'Date must be in YYYY-MM-DD format';
      }
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Please enter a valid date';
      }
    }

    // Pattern validation
    if (field.pattern && value) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        return `${field.label} format is invalid`;
      }
    }

    return undefined;
  };

  // Validate all fields
  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    
    fields.forEach((field) => {
      const error = validateField(field, formData[field.name] || '', formData);
      if (error) {
        errors[field.name] = error;
      }
    });
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle field blur for validation
  const handleFieldBlur = (field: BaseDialogField) => {
    const error = validateField(field, formData[field.name] || '', formData);
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field.name] = error;
      } else {
        delete newErrors[field.name];
      }
      return newErrors;
    });
  };

  // Generate initial data from fields
  const getInitialData = () => {
    const initial: Record<string, string> = {};
    fields.forEach((field) => {
      initial[field.name] = field.defaultValue || '';
    });
    return initial;
  };

  // Generate persistence key from title if not provided
  const persistenceKey = formPersistenceKey || `dialog-${title.toLowerCase().replace(/\s+/g, '-')}`;

  // Use form persistence hook
  // useFormPersistence returns [formData, setFormData, clearFormData, resetFormData].
  // Only the first three are needed in this component.
  const [formData, setFormData, clearFormData] = useFormPersistence(
    persistenceKey,
    getInitialData(),
    {
      enabled: !disablePersistence,
      expiryMs: 60 * 60 * 1000, // 1 hour
      excludeFields: [], // Include all fields by default
    }
  );

  // Check if any field has cols property to determine layout
  const hasMultiColumnLayout = fields.some((field) => field.cols !== undefined);

  useEffect(() => {
    if (triggerOpen) {
      setOpen(true);
    }
  }, [triggerOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Find the field config to check for transform
    const field = fields.find((f) => f.name === name);
    let transformedValue = value;
    
    if (field?.transform) {
      if (field.transform === 'uppercase') {
        transformedValue = value.toUpperCase();
      } else if (field.transform === 'lowercase') {
        transformedValue = value.toLowerCase();
      } else if (field.transform === 'capitalize') {
        transformedValue = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      [name]: transformedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all fields before submission
    if (!validateAllFields()) {
      setAlert({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the validation errors before submitting',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await onSubmit(formData);
      
      // Clear form data after successful submission
      clearFormData();
      handleOpenChange(false);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setAlert({
        type: 'error',
        title: 'Submission Failed',
        message: errorMessage,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: BaseDialogField) => {
    const hasError = !!fieldErrors[field.name];
    const commonProps = {
      id: field.name,
      name: field.name,
      placeholder: field.placeholder,
      value: formData[field.name],
      onChange: handleInputChange,
      onBlur: () => handleFieldBlur(field),
      required: field.required,
      minLength: field.minLength,
      maxLength: field.maxLength,
      pattern: field.pattern,
      readOnly: field.readOnly,
      disabled: field.readOnly,
    };

    // Add uppercase class if transform is uppercase
    const upperCaseClass = field.transform === 'uppercase' ? 'uppercase' : '';
    const errorBorderClass = hasError ? 'border-red-500' : '';

    if (field.type === 'custom' && field.customRender) {
      return field.customRender(formData[field.name] || '', (value: string) => {
        const syntheticEvent = {
          target: {
            name: field.name,
            value: value,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        handleInputChange(syntheticEvent);
      });
    }

    if (field.type === 'textarea') {
      return (
        <Textarea
          key={field.name}
          {...commonProps}
          rows={field.rows || 3}
          className={`bg-[#0f172a] border-[#334155] ${upperCaseClass} ${errorBorderClass}`}
        />
      );
    }

    if (field.type === 'select') {
      const selectValue = formData[field.name] || undefined;
      return (
        <Select key={field.name} value={selectValue} onValueChange={(value) => {
          const syntheticEvent = {
            target: {
              name: field.name,
              value: value,
            },
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          handleInputChange(syntheticEvent);
          // Validate on change for select
          setTimeout(() => handleFieldBlur(field), 0);
        }}>
          <SelectTrigger className={`bg-[#0f172a] border-[#334155] ${errorBorderClass}`}>
            <SelectValue placeholder={field.placeholder} />
          </SelectTrigger>
          <SelectContent variant="glass">
            {field.options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        key={field.name}
        type={field.type === 'date' ? 'date' : field.type || 'text'}
        {...commonProps}
        className={`bg-[#0f172a] border-[#334155] ${upperCaseClass} ${errorBorderClass} ${field.type === 'number' ? '[&::-webkit-outer-spin-button]:[appearance:none] [&::-webkit-inner-spin-button]:[appearance:none] [&]:[-moz-appearance:textfield]' : ''}`}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {children && (
          <div className="py-4">
            {children}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={hasMultiColumnLayout ? "grid grid-cols-2 gap-4" : "space-y-4"}>
            {fields.map((field) => (
              <div
                key={field.name}
                className={`space-y-2 ${
                  hasMultiColumnLayout && field.cols === 2 ? 'col-span-2' : ''
                }`}
              >
                <label htmlFor={field.name} className="flex items-center gap-2 text-sm leading-none font-medium select-none">
                  {field.label}
                  {field.required && <span className="text-red-500">*</span>}
                </label>
                {renderField(field)}
                {fieldErrors[field.name] ? (
                  <p className="text-xs text-red-400">
                    {fieldErrors[field.name]}
                  </p>
                ) : (
                  field.type === 'text' && field.minLength && (
                    <p className="text-xs text-muted-foreground">
                      {field.minLength}-{field.maxLength || '∞'} characters
                    </p>
                  )
                )}
              </div>
            ))}
          </div>

          <InlineError message={error} />

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="glass"
              onClick={() => handleOpenChange(false)}
              className="cursor-pointer"
            >
              {cancelLabel}
            </Button>
            <ButtonPrimary
              type="submit"
              disabled={loading}
              className="cursor-pointer"
            >
              {loading ? 'Loading...' : submitLabel}
            </ButtonPrimary>
          </div>
        </form>
      </DialogContent>
      <FloatingAlert alert={alert} onClose={() => setAlert(null)} />
    </Dialog>
  );
};
