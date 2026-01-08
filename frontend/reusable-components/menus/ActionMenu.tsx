'use client';

import * as React from 'react';
import { LucideIcon, MoreVertical } from 'lucide-react';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/frontend/reusable-elements/dropdowns/DropdownMenu';
import { cn } from '@/lib/utils';
import { useAnalytics } from '@/hooks/useAnalytics';

export interface ActionMenuItem {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  show?: boolean;
  /** Button name for analytics tracking (defaults to label if not provided) */
  buttonName?: string;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  align?: 'start' | 'end';
  triggerClassName?: string;
  menuContentClassName?: string;
  buttonSize?: 'sm' | 'icon';
  iconSize?: string;
}

export function ActionMenu({
  items,
  align = 'end',
  triggerClassName,
  menuContentClassName,
  buttonSize = 'icon',
  iconSize = 'w-3.5 h-3.5',
}: ActionMenuProps) {
  const { trackButton } = useAnalytics();
  
  // Filter items based on show prop
  const visibleItems = items.filter(item => item.show !== false);

  // Don't render if no visible items
  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size={buttonSize}
          className={cn(
            buttonSize === 'icon' ? 'h-6 w-6 -mt-1 shrink-0 hover:bg-white/10' : 'cursor-pointer',
            triggerClassName
          )}
        >
          <MoreVertical className={iconSize} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className={menuContentClassName}>
        {visibleItems.map((item, index) => {
          const Icon = item.icon;
          const isDestructive = item.variant === 'destructive';
          
          return (
            <DropdownMenuItem
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                
                // Execute onClick immediately (don't wait for analytics)
                item.onClick();
                
                // Track button click (fire-and-forget, non-blocking)
                const buttonName = item.buttonName || item.label;
                trackButton(buttonName, {
                  variant: item.variant || 'default',
                  context: 'ActionMenu',
                }).catch((error) => {
                  // Silently fail - analytics should not break the app
                  console.error('Failed to track action menu click:', error);
                });
              }}
              className={cn(
                'hover:bg-white/10',
                isDestructive && 'text-red-400 hover:bg-red-400/10'
              )}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

