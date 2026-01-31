/**
 * React Hook for Firebase Analytics
 * Provides easy access to analytics functions in React components
 */

import { useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  trackEvent,
  trackPageView,
  setAnalyticsUserId,
  setAnalyticsUserProperties,
  analyticsEvents,
  type AnalyticsEventParams,
} from '@/lib/firebase/analytics';

/**
 * Hash email for privacy-compliant analytics identification
 * Creates a consistent hash that doesn't expose the actual email
 * Uses SHA-256 for secure hashing
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function hashEmail(email: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side: use Node.js crypto
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex').substring(0, 16);
  }
  
  // Client-side: use Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(email.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex.substring(0, 16); // Use first 16 chars for shorter hash
}

/**
 * Hook for Firebase Analytics
 * Automatically sets user ID when session changes
 */
export function useAnalytics() {
  const { data: session } = useSession();
  const pathname = usePathname();

  // Set user ID when session changes
  useEffect(() => {
    const updateAnalytics = async () => {
      if (session?.user?.id) {
        setAnalyticsUserId(session.user.id);
        
        // Set user properties (non-PII only)
        // Note: We avoid sending PII like email addresses for privacy compliance
        // Email is available via session.user.email but we don't send it to analytics
        const properties: Record<string, string | undefined> = {
          role: session.user.roleName || undefined,
        };

        // Optional: Use hashed email for analytics if needed (privacy-compliant)
        // Uncomment the next lines if you want to track users by hashed email
        // if (session.user.email) {
        //   properties.user_email_hash = await hashEmail(session.user.email);
        // }
        
        setAnalyticsUserProperties(properties);
      } else {
        // Clear user ID on logout
        setAnalyticsUserId(null);
      }
    };

    updateAnalytics();
  }, [session]);

  const track = useCallback(async (eventName: string, params?: AnalyticsEventParams) => {
    await trackEvent(eventName, params);
  }, []);

  const trackPage = useCallback(async (path: string, title?: string) => {
    await trackPageView(path, title);
  }, []);

  return {
    track,
    trackPage,
    events: analyticsEvents,
    // Convenience methods for common actions
    trackButton: useCallback(
      async (buttonName: string, context?: Record<string, string | number | boolean>) => {
        await analyticsEvents.buttonClicked(
          buttonName,
          pathname || undefined,
          context ? JSON.stringify(context) : undefined
        );
      },
      [pathname]
    ),
    trackDialog: async (action: 'opened' | 'closed', dialogName: string, context?: string) => {
      if (action === 'opened') {
        await analyticsEvents.dialogOpened(dialogName, context);
      } else {
        await analyticsEvents.dialogClosed(dialogName, context);
      }
    },
    trackForm: async (formName: string, success: boolean, context?: string) => {
      await analyticsEvents.formSubmitted(formName, success, context);
    },
  };
}

