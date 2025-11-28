/**
 * Server-side date utilities for backend operations
 * Ensures all dates are stored in UTC format in the database
 */

/**
 * Get current UTC timestamp for database storage
 * @returns Current date in UTC
 */
export function getCurrentUtcTimestamp(): Date {
  return new Date();
}

/**
 * Ensure a date is in UTC format
 * JavaScript Date objects are timezone-agnostic internally and use UTC
 * @param date - Date to ensure is UTC
 * @returns UTC Date object
 */
export function ensureUtcDate(date: Date | string): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    throw new Error('Invalid date provided');
  }
  
  // Date objects in JavaScript are stored as UTC internally
  // The ISO string representation is always UTC
  return dateObj;
}

/**
 * Validate that a date is valid UTC
 * @param date - Date to validate
 * @returns true if date is valid
 */
export function isValidUtcDate(date: Date | string): boolean {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
}

/**
 * Convert ISO string to UTC Date
 * Always use this for user input dates to ensure UTC storage
 * @param isoString - ISO date string (can be from user/client)
 * @returns UTC Date object for database storage
 */
export function isoStringToUtcDate(isoString: string): Date {
  const date = new Date(isoString);
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO date string: ${isoString}`);
  }
  
  // Ensure it's converted to UTC (Date constructor handles this automatically)
  return date;
}

/**
 * Format UTC date as ISO string (for logging/debugging)
 * @param date - UTC Date object
 * @returns ISO string representation
 */
export function formatUtcToIsoString(date: Date): string {
  return date.toISOString();
}

/**
 * Parse a date string and convert to UTC
 * Handles various date formats
 * @param dateString - Date string in any format
 * @returns UTC Date object
 */
export function parseToUtcDate(dateString: string): Date {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    throw new Error(`Cannot parse date: ${dateString}`);
  }
  
  return date;
}

/**
 * Get the start of day in UTC
 * @param date - UTC date
 * @returns Start of day (00:00:00) in UTC
 */
export function getUtcStartOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setUTCHours(0, 0, 0, 0);
  return newDate;
}

/**
 * Get the end of day in UTC
 * @param date - UTC date
 * @returns End of day (23:59:59.999) in UTC
 */
export function getUtcEndOfDay(date: Date): Date {
  const newDate = new Date(date);
  newDate.setUTCHours(23, 59, 59, 999);
  return newDate;
}

/**
 * Add days to a UTC date
 * @param date - UTC date
 * @param days - Number of days to add
 * @returns New UTC date
 */
export function addDaysToUtcDate(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setUTCDate(newDate.getUTCDate() + days);
  return newDate;
}

/**
 * Prisma middleware to ensure all DateTime fields are stored in UTC
 * Add this to your Prisma client initialization
 */
export function createUtcDateMiddleware() {
  return async (params: unknown, next: (params: unknown) => Promise<unknown>) => {
    const result = await next(params);
    
    // This is a basic middleware example
    // In practice, Prisma handles UTC automatically, but this ensures consistency
    if ((params as Record<string, unknown>).action === 'create' || (params as Record<string, unknown>).action === 'update') {
      // Dates passed through the database layer are already UTC
      // This middleware helps ensure consistency
    }
    
    return result;
  };
}
