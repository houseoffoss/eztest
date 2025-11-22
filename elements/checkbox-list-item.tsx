'use client';

import { Checkbox } from '@/elements/checkbox';
import { Label } from '@/elements/label';
import { cn } from '@/lib/utils';

interface CheckboxListItemProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
  rightContent?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact';
  checkboxVariant?: 'default' | 'glass';
  onClick?: () => void;
}

/**
 * Reusable checkbox list item component - following UI page design pattern
 * Combines checkbox, label, and optional description in a consistent format
 * Used in dialogs for selecting items (test cases, test suites, etc.)
 */
export function CheckboxListItem({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  rightContent,
  className,
  variant = 'default',
  checkboxVariant = 'glass',
  onClick,
}: CheckboxListItemProps) {
  const isCompact = variant === 'compact';

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded transition-colors cursor-pointer',
        isCompact && 'items-center',
        className
      )}
      onClick={onClick}
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(newChecked) => onCheckedChange(newChecked as boolean)}
        variant={checkboxVariant}
        className="flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <Label 
          htmlFor={id} 
          className="text-sm font-medium text-white/90 cursor-pointer block"
        >
          {label}
        </Label>
        {description && !isCompact && (
          <p className="text-xs text-white/60 mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>
      {rightContent && (
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {rightContent}
        </div>
      )}
    </div>
  );
}
