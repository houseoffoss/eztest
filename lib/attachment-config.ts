/**
 * Attachment Feature Configuration
 * Provides utilities to check if attachments feature is enabled
 */

import { getEnv } from './env-validation';

/**
 * Check if attachments feature is enabled
 * This can be used on the server-side
 */
export function isAttachmentsEnabled(): boolean {
  try {
    const env = getEnv();
    return env.enableAttachments;
  } catch {
    // If env validation fails, default to false (safer)
    return false;
  }
}

// Cache the promise and timestamp so we don't refetch too often
let featureConfigPromise: Promise<boolean> | null = null;
let featureConfigCacheTime: number = 0;
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Check if attachments feature is enabled from client-side
 * Fetches the setting from the server at runtime
 * Caches the result for 5 minutes to avoid excessive API calls
 */
export function isAttachmentsEnabledClient(): Promise<boolean> {
  const now = Date.now();
  
  // Return cached promise if still valid (within 5 minutes)
  if (featureConfigPromise && (now - featureConfigCacheTime) < CACHE_DURATION_MS) {
    return featureConfigPromise;
  }

  // Create and cache new fetch promise
  featureConfigPromise = (async () => {
    try {
      const response = await fetch('/api/config/features');
      if (response.ok) {
        const data = await response.json();
        return data.enableAttachments === true;
      }
    } catch (error) {
      console.error('Failed to fetch feature config:', error);
    }
    // Fallback to false if fetch fails
    return false;
  })();

  featureConfigCacheTime = now;
  return featureConfigPromise;
}
