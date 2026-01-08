/**
 * Hook for tracking button clicks
 * Automatically tracks button clicks with page context
 */

import { useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { analyticsEvents } from '@/lib/firebase/analytics';

/**
 * Hook to track button clicks
 * Usage: const trackButton = useButtonTracking();
 *        trackButton('create_project', { project_id: '123' });
 */
export function useButtonTracking() {
  const pathname = usePathname();

  const trackButton = useCallback(
    async (buttonName: string, context?: Record<string, string | number | boolean>) => {
      await analyticsEvents.buttonClicked(
        buttonName,
        pathname || undefined,
        context ? JSON.stringify(context) : undefined
      );
    },
    [pathname]
  );

  return trackButton;
}

