/**
 * Utility functions for date formatting
 * 
 * IMPORTANT: All dates stored in the database should be in UTC format.
 * These formatting functions automatically convert UTC dates to the user's local browser timezone.
 */

/**
 * Convert a UTC date string/Date to the user's local timezone
 * @param date - UTC date to convert
 * @returns Date object in user's local timezone
 */
export function utcToLocal(date: string | Date): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return new Date();
  }
  
  // JavaScript Date objects automatically handle UTC to local conversion
  // when you call getHours(), getMinutes(), etc.
  return dateObj;
}

/**
 * Convert a local date to UTC string (for sending to server/database)
 * @param date - Local date to convert
 * @returns UTC ISO string
 */
export function localToUtc(date: Date): string {
  return date.toISOString();
}

/**
 * Get current time in UTC (for server operations)
 * @returns Current UTC date
 */
export function getCurrentUtcDate(): Date {
  return new Date();
}

/**
 * Format date in DD-MMM-YYYY format (e.g., 01-Apr-2000)
 * Automatically converts UTC to user's local timezone
 */
export function formatDate(date: string | Date): string {
  const dateObj = utcToLocal(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const year = dateObj.getFullYear();
  
  return `${day}-${month}-${year}`;
}

/**
 * Format date with time in DD-MMM-YYYY HH:MM:SS format
 * Automatically converts UTC to user's local timezone
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = utcToLocal(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');
  
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

/**
 * Format date with extended timezone info
 * Automatically converts UTC to user's local timezone
 */
export function formatDateWithTimezone(date: string | Date): string {
  const dateObj = utcToLocal(date);
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  const formatted = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });
  
  return formatted;
}

/**
 * Get user's timezone offset in hours
 * @returns Timezone offset (e.g., -5 for EST, +1 for CET)
 */
export function getTimezoneOffset(): number {
  return -new Date().getTimezoneOffset() / 60;
}

/**
 * Get user's timezone name
 * @returns Timezone name (e.g., 'EST', 'PST', 'UTC')
 */
export function getTimezoneName(): string {
  const formatter = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' });
  return formatter.formatToParts(new Date()).find(part => part.type === 'timeZoneName')?.value || 'UTC';
}
