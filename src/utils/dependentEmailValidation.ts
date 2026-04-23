import type { Dependent } from '../hooks/useEnrollmentStorage';

const BASIC_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const DEPENDENT_EMAIL_DUPLICATE_ERROR =
  'Your email address needs to be different from any other email addresses';

export function getDependentEmailDuplicateError(
  email: string,
  dependentIndex: number,
  dependents: Dependent[],
  mainSubscriberEmail: string
): string | null {
  const trimmed = email.trim();
  if (!trimmed || !BASIC_EMAIL_REGEX.test(trimmed)) {
    return null;
  }

  const normalized = trimmed.toLowerCase();
  const mainTrimmed = mainSubscriberEmail.trim();
  if (mainTrimmed && normalized === mainTrimmed.toLowerCase()) {
    return DEPENDENT_EMAIL_DUPLICATE_ERROR;
  }

  for (let i = 0; i < dependents.length; i++) {
    if (i === dependentIndex) continue;
    const other = dependents[i]?.email?.trim();
    if (!other) continue;
    if (normalized === other.toLowerCase()) {
      return DEPENDENT_EMAIL_DUPLICATE_ERROR;
    }
  }

  return null;
}
