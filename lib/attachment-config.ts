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

/**
 * Check if attachments feature is enabled from client-side
 * Uses public environment variable that's exposed via next.config.ts
 */
export function isAttachmentsEnabledClient(): boolean {
  // Check the env variable exposed via next.config.ts
  // This works both on client and server during SSR
  return process.env.ENABLE_ATTACHMENTS === 'true';
}
