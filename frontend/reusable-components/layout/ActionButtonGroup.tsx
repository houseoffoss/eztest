'use client';

import * as React from 'react';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionButton {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  show?: boolean;
  loading?: boolean;
  disabled?: boolean;
  /** Button name for analytics tracking (defaults to label if not provided) */
  buttonName?: string;
  /** Disable analytics tracking for this button */
  disableTracking?: boolean;
}

export interface ActionButtonGroupProps {
  buttons: ActionButton[];
  className?: string;
  gap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
  sm: 'gap-2',
  md: 'gap-2',
  lg: 'gap-3',
};

export function ActionButtonGroup({
  buttons,
  className,
  gap = 'md',
}: ActionButtonGroupProps) {
  const visibleButtons = buttons.filter(button => button.show !== false);

  if (visibleButtons.length === 0) {
    return null;
  }

  return (
    <div className={cn('flex flex-wrap', gapClasses[gap], className)}>
      {visibleButtons.map((button, index) => {
        const Icon = button.icon;
        const ButtonComponent = button.variant === 'secondary' ? ButtonSecondary : ButtonPrimary;

        return (
          <ButtonComponent
            key={index}
            onClick={button.onClick}
            className="cursor-pointer"
            disabled={button.disabled || button.loading}
            buttonName={button.buttonName || button.label}
            disableTracking={button.disableTracking}
          >
            {button.loading ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {button.label}
              </>
            ) : (
              <>
                <Icon className="w-4 h-4 mr-2" />
                {button.label}
              </>
            )}
          </ButtonComponent>
        );
      })}
    </div>
  );
}

