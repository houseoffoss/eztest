/**
 * Client-side date utilities for frontend operations
 * All these functions work with UTC dates from the server and convert them to user's local timezone
 */

/**
 * Convert UTC ISO string to user's local Date object
 * @param utcDateString - ISO string from server (always in UTC)
 * @returns Date object automatically adjusted to user's local timezone
 */
export function convertUtcToLocal(utcDateString: string | Date): Date {
  const date = typeof utcDateString === 'string' ? new Date(utcDateString) : utcDateString;
  
  if (isNaN(date.getTime())) {
    return new Date();
  }
  
  // JavaScript automatically handles UTC to local conversion
  return date;
}

/**
 * Convert local Date object to UTC ISO string for sending to server
 * @param localDate - Local date to convert
 * @returns UTC ISO string
 */
export function convertLocalToUtc(localDate: Date): string {
  return localDate.toISOString();
}

/**
 * Format a date for relative time display (e.g., "2 hours ago")
 * @param date - UTC date from server
 * @returns Relative time string
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = convertUtcToLocal(date);
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  // Fallback to standard format for older dates
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get user's current timezone information
 */
export function getUserTimezoneInfo() {
  const now = new Date();
  
  // Get timezone name
  const formatter = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' });
  const parts = formatter.formatToParts(now);
  const timezoneName = parts.find(part => part.type === 'timeZoneName')?.value || 'UTC';
  
  // Get offset in hours
  const offset = -now.getTimezoneOffset() / 60;
  
  return {
    name: timezoneName,
    offset,
    offsetString: `UTC${offset >= 0 ? '+' : ''}${offset}`,
  };
}

/**
 * Check if a date is today
 * @param date - UTC date from server
 * @returns true if the date is today in user's timezone
 */
export function isToday(date: string | Date): boolean {
  const dateObj = convertUtcToLocal(date);
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
}

/**
 * Check if a date is yesterday
 * @param date - UTC date from server
 * @returns true if the date is yesterday in user's timezone
 */
export function isYesterday(date: string | Date): boolean {
  const dateObj = convertUtcToLocal(date);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  return dateObj.toDateString() === yesterday.toDateString();
}
