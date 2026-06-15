/**
 * Central pagination defaults for list views across the app.
 *
 * Keep all "items per page" defaults and selector options here so the system
 * has a single, consistent paging experience. Changing DEFAULT_PAGE_SIZE here
 * updates every list that uses it.
 */

/** Default number of items shown per page in list views. */
export const DEFAULT_PAGE_SIZE = 25;

/** Options offered in the "Show N per page" selector. */
export const PAGE_SIZE_OPTIONS: number[] = [10, 25, 50, 100];
