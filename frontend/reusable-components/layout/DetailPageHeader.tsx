'use client';

import * as React from 'react';
import { Badge } from '@/frontend/reusable-elements/badges/Badge';
import { Button } from '@/frontend/reusable-elements/buttons/Button';
import { ButtonPrimary } from '@/frontend/reusable-elements/buttons/ButtonPrimary';
import { ButtonDestructive } from '@/frontend/reusable-elements/buttons/ButtonDestructive';
import { Input } from '@/frontend/reusable-elements/inputs/Input';
import { LucideIcon, Save, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BadgeItem {
  label: string;
  value: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface ActionButton {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'destructive';
  show?: boolean;
}

export interface DetailPageHeaderProps {
  title: string;
  subtitle?: string;
  isEditing?: boolean;
  editTitle?: string;
  onTitleChange?: (title: string) => void;
  badges?: BadgeItem[];
  actions?: ActionButton[];
  editActions?: {
    onSave: () => void;
    onCancel: () => void;
    saving?: boolean;
  };
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  maxLength?: number;
}

/**
 * Reusable header component for detail pages with title editing, badges, and actions
 * 
 * @example
 * ```tsx
 * <DetailPageHeader
 *   title={testCase.title}
 *   subtitle={`${testCase.project.name} (${testCase.project.key})`}
 *   isEditing={isEditing}
 *   editTitle={formData.title}
 *   onTitleChange={(title) => setFormData({ ...formData, title })}
 *   badges={[
 *     { label: 'Priority', value: testCase.priority, className: getPriorityColor(testCase.priority) },
 *     { label: 'Status', value: testCase.status, className: getStatusColor(testCase.status) },
 *   ]}
 *   actions={[
 *     { label: 'Edit', icon: Edit, onClick: onEdit, show: canUpdate },
 *     { label: 'Delete', icon: Trash2, onClick: onDelete, variant: 'destructive', show: canDelete },
 *   ]}
 *   editActions={{
 *     onSave: handleSave,
 *     onCancel: handleCancel,
 *     saving: saving,
 *   }}
 * />
 * ```
 */
export function DetailPageHeader({
  title,
  subtitle,
  isEditing = false,
  editTitle,
  onTitleChange,
  badges = [],
  actions = [],
  editActions,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  maxLength,
}: DetailPageHeaderProps) {
  const visibleActions = actions.filter(action => action.show !== false);

  return (
    <div className={cn('mb-6', className)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="w-full min-w-0">
          <h1 className={cn('text-3xl font-bold text-white mb-1 break-words', titleClassName)}>
            {isEditing && onTitleChange ? (
              <Input
                value={editTitle || title}
                onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                  onTitleChange(e.target.value)
                }
                className="text-3xl font-bold text-white bg-white/5 border-white/10"
                maxLength={maxLength}
              />
            ) : (
              <span className="block">{title}</span>
            )}
          </h1>
          {subtitle && (
            <p className={cn('text-white/60 mb-3', subtitleClassName)}>
              {subtitle}
            </p>
          )}
          {badges.length > 0 && (
            <div className="flex items-center gap-6 text-sm flex-wrap">
              {badges.map((badge, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-white/60">{badge.label}:</span>
                  <Badge
                    variant="outline"
                    className={badge.className}
                    style={badge.style}
                  >
                    {badge.value}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {isEditing && editActions ? (
            <>
              <Button variant="glass" onClick={editActions.onCancel} className="cursor-pointer" disabled={editActions.saving}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <ButtonPrimary onClick={editActions.onSave} className="cursor-pointer" disabled={editActions.saving}>
                {editActions.saving ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </>
                )}
              </ButtonPrimary>
            </>
          ) : (
            visibleActions.map((action, index) => {
              const Icon = action.icon;
              
              if (action.variant === 'destructive') {
                return (
                  <ButtonDestructive
                    key={index}
                    onClick={action.onClick}
                    className="cursor-pointer"
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </ButtonDestructive>
                );
              }
              
              return (
                <Button
                  key={index}
                  variant="glass"
                  onClick={action.onClick}
                  className="cursor-pointer"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {action.label}
                </Button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

