'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface Avatar {
  id: string;
  name: string;
  avatar?: string | null;
  email?: string;
}

export interface AvatarStackProps {
  avatars: Avatar[];
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
  avatarClassName?: string;
}

const sizeClasses = {
  sm: {
    avatar: 'w-6 h-6 text-xs',
    border: 'border-2',
  },
  md: {
    avatar: 'w-7 h-7 text-xs',
    border: 'border-2',
  },
  lg: {
    avatar: 'w-8 h-8 text-sm',
    border: 'border-2',
  },
};

export function AvatarStack({
  avatars,
  maxVisible = 3,
  size = 'md',
  showCount = true,
  className,
  avatarClassName,
}: AvatarStackProps) {
  const visibleAvatars = avatars.slice(0, maxVisible);
  const remainingCount = avatars.length - maxVisible;
  const sizeClass = sizeClasses[size];

  return (
    <div className={cn('flex -space-x-1.5', className)}>
      {visibleAvatars.map((avatar) => (
        <div
          key={avatar.id}
          className={cn(
            'rounded-full bg-primary text-white flex items-center justify-center font-semibold border-background',
            sizeClass.avatar,
            sizeClass.border,
            avatarClassName
          )}
          title={avatar.name}
        >
          {avatar.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatar.avatar}
              alt={avatar.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            avatar.name.charAt(0).toUpperCase()
          )}
        </div>
      ))}
      {remainingCount > 0 && showCount && (
        <div
          className={cn(
            'rounded-full bg-white/10 text-white/70 flex items-center justify-center font-semibold border-background',
            sizeClass.avatar,
            sizeClass.border,
            avatarClassName
          )}
          title={`${remainingCount} more member${remainingCount !== 1 ? 's' : ''}`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

