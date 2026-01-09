/**
 * Utility functions for dynamic badge colors based on dropdown options
 */

import { DropdownOption } from '@/hooks/useDropdownOptions';

/**
 * Static color mapping for existing badge values
 * These are the original badge colors that should remain consistent
 * New dropdown options added by users will use dynamic colors
 */
const STATIC_BADGE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  // Defect Severity
  'CRITICAL': { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
  'HIGH': { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500/20' },
  'MEDIUM': { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
  'LOW': { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  
  // Defect Priority (same as severity)
  // Note: CRITICAL, HIGH, MEDIUM, LOW are already defined above
  
  // Defect Status
  'NEW': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  'IN_PROGRESS': { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
  'FIXED': { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  'TESTED': { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500/20' },
  'CLOSED': { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' },
  
  // TestCase Priority (same as defect priority)
  // Note: CRITICAL, HIGH, MEDIUM, LOW are already defined above
  
  // TestCase Status
  'ACTIVE': { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  'DRAFT': { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
  'DEPRECATED': { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' },
  
  // TestRun Status
  'PLANNED': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  // Note: IN_PROGRESS is already defined above for Defect Status (purple)
  // For TestRun, IN_PROGRESS should be yellow, but since it shares the same value with Defect,
  // we'll keep it as purple. If needed, we can add a separate mapping later.
  'COMPLETED': { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
  'CANCELLED': { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' },
  
  // TestResult Status
  'PASSED': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  'FAILED': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  'BLOCKED': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  'SKIPPED': { bg: 'bg-gray-500/10', text: 'text-gray-400', border: 'border-gray-500/20' },
  'RETEST': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  
  // Requirement Status
  // Note: DRAFT and DEPRECATED are already defined above for TestCase Status
  'APPROVED': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/20' },
  'IMPLEMENTED': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  'VERIFIED': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  
  // Environment (common values - note: values are case-sensitive as stored in DB)
  'Production': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  'Staging': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  'QA': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  'Development': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
};

/**
 * Color palette used when no custom color is specified
 * Generates consistent colors based on value hash
 */
const COLOR_PALETTES = [
  { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  { bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/30' },
  { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
  { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30' },
  { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
];

/**
 * Generate a hash from a string
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get badge color classes from a hash-based palette
 */
function getColorFromPalette(value: string): { bg: string; text: string; border: string } {
  const index = hashString(value) % COLOR_PALETTES.length;
  return COLOR_PALETTES[index];
}

/**
 * Convert hex color to Tailwind-like classes
 * This is a simplified version - in production, you might want to use inline styles
 */
function hexToTailwindClasses(hexColor: string): { bg: string; text: string; border: string } {
  // For now, we'll map common colors to Tailwind classes
  // In a real implementation, you might use inline styles with the hex color
  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    '#ef4444': { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
    '#f97316': { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
    '#f59e0b': { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    '#eab308': { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
    '#84cc16': { bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/30' },
    '#22c55e': { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
    '#10b981': { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    '#14b8a6': { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
    '#06b6d4': { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    '#0ea5e9': { bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
    '#3b82f6': { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
    '#6366f1': { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
    '#8b5cf6': { bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
    '#a855f7': { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    '#d946ef': { bg: 'bg-fuchsia-500/10', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30' },
    '#ec4899': { bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
    '#f43f5e': { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  };

  const normalizedColor = hexColor.toLowerCase();
  return colorMap[normalizedColor] || getColorFromPalette(hexColor);
}

/**
 * Get badge color classes for a dropdown option value
 * Priority order:
 * 1. Static colors for existing badge values (CRITICAL, HIGH, etc.)
 * 2. Dynamic colors from dropdown option (for new options added by users)
 * 3. Hash-based palette fallback
 * 
 * @param value - The dropdown value (e.g., "HIGH", "CRITICAL")
 * @param options - Array of dropdown options to search for color
 * @returns Object with bg, text, and border Tailwind classes
 */
export function getBadgeColorClasses(
  value: string,
  options: DropdownOption[]
): { bg: string; text: string; border: string } {
  // First, check if this is an existing badge with static color
  const staticColor = STATIC_BADGE_COLORS[value];
  if (staticColor) {
    return staticColor;
  }
  
  // Second, check if dropdown option has a custom color (for new options)
  const option = options.find(opt => opt.value === value);
  if (option?.color) {
    return hexToTailwindClasses(option.color);
  }
  
  // Finally, fall back to hash-based color
  return getColorFromPalette(value);
}

/**
 * Get inline styles for a badge from a hex color
 * Useful when Tailwind classes are not sufficient
 * 
 * @param hexColor - Hex color string (e.g., "#FF0000")
 * @returns Object with CSS properties for background, text, and border
 */
export function getBadgeInlineStyles(hexColor: string): {
  backgroundColor: string;
  color: string;
  borderColor: string;
} {
  // Convert hex to RGB
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return {
    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
    color: `rgb(${Math.min(r + 50, 255)}, ${Math.min(g + 50, 255)}, ${Math.min(b + 50, 255)})`,
    borderColor: `rgba(${r}, ${g}, ${b}, 0.3)`,
  };
}

/**
 * Get combined classes and styles for a dropdown value
 * Priority order:
 * 1. Static colors for existing badge values (CRITICAL, HIGH, etc.)
 * 2. Dynamic colors from dropdown option (for new options added by users)
 * 3. Hash-based palette fallback
 * 
 * @param value - The dropdown value
 * @param options - Array of dropdown options
 * @returns Object with className string and optional style object
 */
export function getDynamicBadgeProps(
  value: string,
  options: DropdownOption[]
): {
  className: string;
  style?: React.CSSProperties;
} {
  // First, check if this is an existing badge with static color
  const staticColor = STATIC_BADGE_COLORS[value];
  if (staticColor) {
    return {
      className: `${staticColor.bg} ${staticColor.text} ${staticColor.border}`,
    };
  }
  
  // Second, check if dropdown option has a custom color (for new options)
  const option = options.find(opt => opt.value === value);
  if (option?.color) {
    const styles = getBadgeInlineStyles(option.color);
    return {
      className: 'border',
      style: styles,
    };
  }
  
  // Finally, fall back to hash-based palette for unknown values
  const classes = getColorFromPalette(value);
  return {
    className: `${classes.bg} ${classes.text} ${classes.border}`,
  };
}
