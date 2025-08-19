/**
 * Truncates a string to a specified length and appends a suffix if truncated.
 * @param str The string to truncate.
 * @param maxLength The maximum allowed length.
 * @param suffix The string to append if truncation occurs (default: '...').
 * @returns The truncated string with suffix if needed.
 */
export function truncateString(
  str: string | undefined | null,
  maxLength: number,
  suffix = '...'
): string {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + suffix : str;
}
