/**
 * Calculates age in years from a birth date string (YYYY-MM-DD or ISO format).
 * Returns 0 if the date is invalid or missing.
 */
export function calculateAge(birthDate: string | null | undefined): number {
  if (!birthDate) return 0;
  const date = new Date(birthDate);
  if (isNaN(date.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const m = today.getMonth() - date.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age;
}
