'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonSecondary } from '@/frontend/reusable-elements/buttons/ButtonSecondary';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { SignOutButton } from '@/frontend/reusable-components/layout/SignOutButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/frontend/reusable-elements/dropdowns/DropdownMenu';
import { ChevronDown } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'destructive';
export type ButtonSize = 'sm' | 'default' | 'lg';

export interface DropdownItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
}

export interface ActionButtonConfig {
  /**
   * Type of button: 'action', 'signout', 'dropdown', or 'custom'
   */
  type: 'action' | 'signout' | 'dropdown' | 'custom';
  
  /**
   * Label text for the button
   */
  label?: string;
  
  /**
   * Icon component from lucide-react
   */
  icon?: LucideIcon;
  
  /**
   * Callback function when button is clicked
   */
  onClick?: () => void | Promise<void>;
  
  /**
   * Button variant
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * Button size
   * @default 'default'
   */
  size?: ButtonSize;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Button name for tracking
   */
  buttonName?: string;
  
  /**
   * For sign-out buttons: show confirmation dialog
   * @default true
   */
  showConfirmation?: boolean;
  
  /**
   * For dropdown buttons: array of items
   */
  items?: DropdownItem[];
  
  /**
   * Custom React node (for complete control)
   */
  custom?: React.ReactNode;
}

export function useNavbarActions() {
  const renderActionButton = (config: ActionButtonConfig, key?: string) => {
    // Custom JSX element
    if (config.type === 'custom' && config.custom) {
      return <React.Fragment key={key}>{config.custom}</React.Fragment>;
    }

    // Sign out button
    if (config.type === 'signout') {
      return (
        <SignOutButton
          key={key}
          label={config.label}
          size={config.size}
          className={config.className}
          buttonName={config.buttonName}
          showConfirmation={config.showConfirmation}
        />
      );
    }

    // Dropdown button
    if (config.type === 'dropdown' && config.items && config.items.length > 0) {
      return (
        <DropdownMenu key={key}>
          <DropdownMenuTrigger asChild>
            <ButtonSecondary className="cursor-pointer flex items-center gap-2">
              {config.label}
              <ChevronDown className="w-4 h-4" />
            </ButtonSecondary>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {config.items.map((item, index) => (
              <DropdownMenuItem key={index} onClick={item.onClick}>
                {item.icon && <item.icon className="w-4 h-4" />}
                {item.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Regular action button
    if (config.type === 'action') {
      const ButtonComponent = {
        primary: ButtonPrimary,
        secondary: ButtonSecondary,
        destructive: ButtonDestructive,
      }[config.variant || 'primary'];

      const Icon = config.icon;

      return (
        <ButtonComponent
          key={key}
          onClick={config.onClick}
          size={config.size || 'default'}
          className={`cursor-pointer flex items-center gap-2 ${config.className || ''}`}
          buttonName={config.buttonName}
        >
          {Icon && <Icon className="w-4 h-4" />}
          {config.label}
        </ButtonComponent>
      );
    }

    return null;
  };

  const renderActionButtons = (configs: ActionButtonConfig[]) => {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-end">
        {configs.map((config, index) => renderActionButton(config, `action-${index}`))}
      </div>
    );
  };

  return {
    renderActionButton,
    renderActionButtons,
  };
}

export default useNavbarActions;

